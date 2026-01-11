var chrome = chrome || {};

var popup = (function () {

    var service = analytics.getService('Design_Grid_Overlay');
    service.getConfig().addCallback(initAnalyticsConfig);
    var tracker = service.getTracker('UA-80131763-3');
    tracker.sendAppView('MainView');
    
    var keyboardShortcutEnabled = false; //it’s a hack to do posiible use keyboard commands to show grid and lines at the very first time (before checkbox click)

    function initAnalyticsConfig(config) {
        var checkbox = document.getElementById('tracking-permitted');
        checkbox.checked = config.isTrackingPermitted();
        checkbox.onchange = function() {
            config.setTrackingPermitted(checkbox.checked);
        };
    }   
    
    var gridForm = document.getElementById('gridForm');
    var gridToggle = document.getElementById('gridToggle');
    var horizontalLinesToggle = document.getElementById('horizontalLinesToggle');
    var reportForm = document.getElementById('reportForm');
    var advancedForm = document.getElementById('advancedForm');
    var tabContentContainer = document.getElementById('gridsettings');
    var tabLabelContainer = document.getElementById('tabContainer');
    var currentChromeTabId = undefined;


    /**
     * Set the click event for the tabs
     */
    var setTabAction = function (tabOuter, tabInner, contentId) {
        $('#' + tabInner).bind("click", function (event) {
            $('.' + tabOuter + ' div[aria-selected=true]').attr("aria-selected", "false");
            this.setAttribute("aria-selected", "true");
            $('.' + tabOuter).find("[aria-hidden=false]").attr("aria-hidden", "true");
            $('#' + contentId).eq($(this).attr('tabindex')).attr("aria-hidden", "false");
        });
    };

    /**
     * Setup tab actions for each tab label and its corresponding tab panel
     */
    setTabAction('tabs', 'tab1', 'panel1');
    setTabAction('tabs', 'tab2', 'panel2');
    setTabAction('tabs', 'tab3', 'panel3');

    /**
     * Allows a user to click any of our external links and open a tab
     */
    var externalLinks = document.getElementsByClassName("extlink");
    for (var i = 0; i < externalLinks.length; i++) {
        externalLinks[i].addEventListener('click', function(e){
            if (this.href !== undefined) {
                chrome.tabs.create({url: this.href})
            }
        });
    }

    /**
     * Will stop the advanced form from submitting
     */
    advancedForm.onsubmit = function () {
        return false;
    };

    /**
     * Will stop the report settings form from submitting
     */
    reportForm.onsubmit = function () {
        return false;
    };


    /**
     * Called when the popup is load. A call
     * to save the tab state and check the grid status is
     * made.
     */
    window.addEventListener('load', function () {

        chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {

            currentChromeTabId = tabs[0].id;

            document.getElementById('tabContainer').addEventListener('click', function () {
                //Save UI state, which includes tab state
                settingStorageController.saveSettings(currentChromeTabId, false);
            });

            //Initialize state
            popup.init();

            chrome.scripting.executeScript({
                target: {tabId: currentChromeTabId},
                files: ['src/executedScripts/gridStatus.js']
            });

            //tabController.getCurrentTabState(tabs[0].id);
        });

        chrome.commands.getAll(function(commands) { // use chrome extension api to get the defined shortcut
            var toggle_columns_html = '';
            var toggle_lines_html = '';
            var activate_extension = '';

            commands.forEach(function(element) {

                switch (element.name) {
                    case 'toggle-columns':
                      toggle_columns_html = element.shortcut;
                      break;
                    case 'toggle-lines':
                      toggle_lines_html = element.shortcut;
                      break;
                    case '_execute_action':
                      activate_html = element.shortcut;
                      break;
                    }
                });
            
            document.getElementById("toggle-v").innerHTML = (toggle_columns_html).split('+').join(' + '); // get and replace shortcut from chrome extension api
            document.getElementById("toggle-h").innerHTML = (toggle_lines_html).split('+').join(' + '); 
            document.getElementById("activate-extension").innerHTML = (activate_html).split('+').join(' + ');
        });


    });

    /**
     * Event that changes the toggle based on if
     * the grid is active or not
     */
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.status !== undefined) {
                if (request.status === 1 && gridToggle.checked === false) {
                    
                    console.log('Grid already enabled on page');
                    gridToggle.checked = true;
                    
                    if (!keyboardShortcutEnabled) { // hack way to use keyboard shortcut before clicing on checkbox
                        var settings = settingStorageController.saveSettings(currentChromeTabId, true);
                        gridController.updateGrid(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
                        keyboardShortcutEnabled = true;
                    }
                    

                } else if (request.status === 0 && gridToggle.checked === true) {
                    gridToggle.checked = false;
                    

                }
            }
            if (request.horizontalLinesStatus !== undefined) {
                if (request.horizontalLinesStatus === 1 && horizontalLinesToggle.checked === false) {
                    console.log('Horizontal lines already enabled on page');
                    horizontalLinesToggle.checked = true;
                    
                    // hack way to use keyboard shortcut before clicing on checkbox
                    var settings = settingStorageController.saveSettings(currentChromeTabId, true); 
                    gridController.updateGrid(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
                
                } else if (request.horizontalLinesStatus === 0 && horizontalLinesToggle.checked === true) {
                    horizontalLinesToggle.checked = false;
                }
            }
        }
    );


    /**
     * A click event listen that will change the values
     * off the grid based on the popup values.
     */
    gridToggle.addEventListener('click', function () {
        var settings = settingStorageController.saveSettings(currentChromeTabId, false);
        gridController.updateGrid(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
        reportController.calculateReport(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
    });

    horizontalLinesToggle.addEventListener('click', function () {
        var settings = settingStorageController.saveSettings(currentChromeTabId, false);
        gridController.updateGrid(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
    });


    /**
     * Adds an event to the reset button
     * in order to reset all the values on
     * the grid to the default values in the
     * popup window.
     */
    gridForm.addEventListener('reset', function () {

        // SetTimeout is used to delay the execution of this code and storage of the DOM state until AFTER the reset
        // event has finished resetting the form values - this reset event is fired BEFORE the DOM state has changed
        setTimeout(function () {
            var settings = settingStorageController.saveSettings(currentChromeTabId, true);
            gridController.updateGrid(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
            reportController.calculateReport(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
            reportController.updateReportOverlay(currentChromeTabId, gridToggle.checked,
                settings.formData.reportForm.settings, settings.formData.advancedForm.settings);
        }, 0);
    });

    /**
     * Shift+Up/Down to go up/down by 10px (issue #25).
     * ----
     * In this case I made it for all
     * number inputs in a "Settings" tab.
     */
    gridForm.addEventListener('keydown', function (e) {
        var target = e.target;

        // check if keydown was in some number input
        if (target.nodeName === 'INPUT') {
            if (target.getAttribute('type').toUpperCase() === 'NUMBER') {
                if (e.shiftKey && e.key === 'ArrowUp') {
                    target.value = parseInt(target.value) + 10;

                    if (target.hasAttribute('max')) {
                        var value = parseInt(target.value);
                        var maxValue = parseInt(target.getAttribute('max'));

                        if (value > maxValue)
                            target.value = maxValue;
                    }

                    e.preventDefault();
                }
                if (e.shiftKey && e.key === 'ArrowDown') {
                    target.value = parseInt(target.value) - 10;

                    if (target.hasAttribute('min')) {
                        var value = parseInt(target.value);
                        var minValue = parseInt(target.getAttribute('min'));

                        if (value < minValue)
                            target.value = minValue;
                    }

                    e.preventDefault();
                }
            }
        }
        var settings = settingStorageController.saveSettings(currentChromeTabId, true);
        gridController.updateGrid(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
    });

    /**
     * Adds an event to the reset button
     * in order to reset all the values on
     * the grid to the default values in the
     * popup window.
     */
    reportForm.addEventListener('reset', function () {

        // SetTimeout is used to delay the execution of this code and storage of the DOM state until AFTER the reset
        // event has finished resetting the form values - this reset event is fired BEFORE the DOM state has changed
        setTimeout(function () {
            console.log('reset');
            var settings = settingStorageController.saveSettings(currentChromeTabId, true);
            gridController.updateGrid(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
            reportController.calculateReport(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
            reportController.updateReportOverlay(currentChromeTabId, gridToggle.checked,
                settings.formData.reportForm.settings, settings.formData.advancedForm.settings);

        }, 0);
    });


    /**
     * Adds an event to the reset button
     * in order to reset all the values on
     * the grid to the default values in the
     * popup window.
     */
    advancedForm.addEventListener('reset', function () {

        // SetTimeout is used to delay the execution of this code and storage of the DOM state until AFTER the reset
        // event has finished resetting the form values - this reset event is fired BEFORE the DOM state has changed
        setTimeout(function () {
            var settings = settingStorageController.saveSettings(currentChromeTabId, true);
            gridController.updateGrid(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
            reportController.calculateReport(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
            reportController.updateReportOverlay(currentChromeTabId, gridToggle.checked,
                settings.formData.reportForm.settings, settings.formData.advancedForm.settings);

        }, 0);
    });


    /**
     * Used to stop a user from incrementing the
     * number field to fast. This stops the event from
     * firing to fast and stops multiple grids
     * from appearing stacked on the page
     */
    var throttle = function (fn, threshhold, scope) {
        threshhold || (threshhold = 250);
        var last,
            deferTimer;
        return function () {
            var context = scope || this;
            var now = +new Date,
                args = arguments;
            if (last && now < last + threshhold) {
                // hold on to it
                clearTimeout(deferTimer);
                deferTimer = setTimeout(function () {
                    last = now;
                    fn.apply(context, args);
                }, threshhold);
            }
            else {
                last = now;
                fn.apply(context, args);
            }
        };
    };

    /**
     * Used to initialize the state of the popup window and inject in-page scripts.
     * Saves the current tab state, generates the grid, and calculates the report.
     */
    var init = function () {
        
        settingStorageController.init(gridForm, reportForm, advancedForm, tabContentContainer, tabLabelContainer);

        /**
         * Heartbeat pattern to determine whether content script is already inject
         * If not it will be injected.
         */
        chrome.tabs.sendMessage(currentChromeTabId, {greeting: "hello"}).then(function (response) {
            if (response) {
                console.log("Design Grid Overlay JS already injected.");

                // Load all stored settings from chrome local storage, and then update the report overlay
                settingStorageController.loadSettings(currentChromeTabId, function (settings) {
                    reportController.calculateReport(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
                    reportController.updateReportOverlay(currentChromeTabId, gridToggle.checked,
                        settings.formData.reportForm.settings, settings.formData.advancedForm.settings);
                });
            }
        }).catch(function(error) {
            // Content script not injected yet
            console.log("Design Grid Overlay JS not already injected, injecting now.");
            console.log('[Init] Error:', error.message);

            chrome.scripting.executeScript({
                target: {tabId: currentChromeTabId},
                files: ["src/executedScripts/grid.js"]
            }).then(() => {
                return chrome.scripting.executeScript({
                    target: {tabId: currentChromeTabId},
                    files: ["src/executedScripts/calcReport.js"]
                });
            }).then(() => {
                // Load all stored settings from chrome local storage, and then update the report overlay
                settingStorageController.loadSettings(currentChromeTabId, function (settings) {
                    reportController.calculateReport(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
                    reportController.updateReportOverlay(currentChromeTabId, gridToggle.checked,
                        settings.formData.reportForm.settings, settings.formData.advancedForm.settings);
                });
            }).catch(function(injectError) {
                console.error('[Init] Failed to inject scripts:', injectError);
            });
        });

        //Grid form event binding
        var gridFormInputs = gridForm.getElementsByTagName('input');
        for (var i = 0; i < gridFormInputs.length; i++) {
            gridFormInputs[i].addEventListener("change", throttle(function (event) {
                if (event.target.id !== 'gridToggle') {
                    //Updated just grid and report calculations
                    var settings = settingStorageController.saveSettings(currentChromeTabId, true);
                    gridController.updateGrid(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
                    reportController.calculateReport(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
                }
            }, 1000));
        }

        //Report form input event binding
        var reportFormInputs = reportForm.getElementsByTagName('input');
        for (var i = 0; i < reportFormInputs.length; i++) {
            reportFormInputs[i].addEventListener("change", throttle(function (event) {
                if (event.target.id !== 'gridToggle') {
                    //Update just report overlay
                    var settings = settingStorageController.saveSettings(currentChromeTabId, true);
                    reportController.updateReportOverlay(currentChromeTabId, gridToggle.checked,
                        settings.formData.reportForm.settings, settings.formData.advancedForm.settings);
                }
            }, 1000));
        }

        //Advanced form input event binding
        var advancedFormInputs = advancedForm.getElementsByTagName('input');
        for (var i = 0; i < advancedFormInputs.length; i++) {
            advancedFormInputs[i].addEventListener("change", throttle(function (event) {
                if (event.target.id !== 'gridToggle') {
                    //Update grid, report, report overlay
                    var settings = settingStorageController.saveSettings(currentChromeTabId, true);
                    reportController.calculateReport(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
                    gridController.updateGrid(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
                    reportController.updateReportOverlay(currentChromeTabId, gridToggle.checked,
                        settings.formData.reportForm.settings, settings.formData.advancedForm.settings);
                }
            }, 1000));
        }

        /**
         * Helper function to convert hex to rgba
         */
        function hexToRgba(hex, opacity) {
            var r = parseInt(hex.slice(1, 3), 16);
            var g = parseInt(hex.slice(3, 5), 16);
            var b = parseInt(hex.slice(5, 7), 16);
            return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (opacity / 100) + ')';
        }

        /**
         * Helper function to extract rgb values from rgba string
         */
        function rgbaToHex(rgba) {
            var parts = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (parts) {
                var r = parseInt(parts[1]).toString(16).padStart(2, '0');
                var g = parseInt(parts[2]).toString(16).padStart(2, '0');
                var b = parseInt(parts[3]).toString(16).padStart(2, '0');
                return '#' + r + g + b;
            }
            return '#000000';
        }

        /**
         * Grid Opacity Slider - Update the display value and apply opacity
         */
        var gridOpacitySlider = document.getElementById('gridOpacity');
        var gridOpacityValue = document.getElementById('gridOpacityValue');

        if (gridOpacitySlider && gridOpacityValue) {
            console.log('[Grid Opacity] Slider initialized with value:', gridOpacitySlider.value);

            // Set initial display value
            gridOpacityValue.textContent = gridOpacitySlider.value + '%';

            // Update display on input (real-time)
            gridOpacitySlider.addEventListener('input', function() {
                console.log('[Grid Opacity] Slider moved to:', this.value + '%');
                gridOpacityValue.textContent = this.value + '%';
            });

            // Update grid when slider changes (after release)
            gridOpacitySlider.addEventListener('change', function() {
                console.log('[Grid Opacity] Change event fired, new value:', this.value);
                var settings = settingStorageController.saveSettings(currentChromeTabId, true);
                console.log('[Grid Opacity] Settings saved, opacity value:', settings.formData.advancedForm.settings.gridOpacity);
                gridController.updateGrid(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
                reportController.calculateReport(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
                console.log('[Grid Opacity] Grid updated with new opacity');
            });
        } else {
            console.error('[Grid Opacity] Slider or value display element not found!');
        }

        /**
         * Color Pickers - Sync with text inputs and update grid
         */
        // Column Color Picker
        var colorPicker = document.getElementById('colorPicker');
        var colorInput = document.getElementById('color');

        if (colorPicker && colorInput) {
            console.log('[Color Picker] Column color picker initialized');

            // Initialize picker from current rgba value
            colorPicker.value = rgbaToHex(colorInput.value);

            colorPicker.addEventListener('input', function() {
                var opacity = gridOpacitySlider ? gridOpacitySlider.value : 20;
                var rgbaColor = hexToRgba(this.value, opacity);
                colorInput.value = rgbaColor;
                console.log('[Color Picker] Column color changed to:', rgbaColor);
            });

            colorPicker.addEventListener('change', function() {
                var settings = settingStorageController.saveSettings(currentChromeTabId, true);
                gridController.updateGrid(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
                console.log('[Color Picker] Grid updated with new column color');
            });
        }

        // Horizontal Lines Color Picker
        var horizontalColorPicker = document.getElementById('horizontalLinesColorPicker');
        var horizontalColorInput = document.getElementById('horizontalLinesColor');

        if (horizontalColorPicker && horizontalColorInput) {
            console.log('[Color Picker] Horizontal lines color picker initialized');

            // Initialize picker from current rgba value
            horizontalColorPicker.value = rgbaToHex(horizontalColorInput.value);

            horizontalColorPicker.addEventListener('input', function() {
                var opacity = gridOpacitySlider ? gridOpacitySlider.value : 20;
                var rgbaColor = hexToRgba(this.value, opacity);
                horizontalColorInput.value = rgbaColor;
                console.log('[Color Picker] Horizontal color changed to:', rgbaColor);
            });

            horizontalColorPicker.addEventListener('change', function() {
                var settings = settingStorageController.saveSettings(currentChromeTabId, true);
                gridController.updateGrid(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
                console.log('[Color Picker] Grid updated with new horizontal color');
            });
        }

        // Label Color Picker
        var labelColorPicker = document.getElementById('overlayLabelColorPicker');
        var labelColorInput = document.getElementById('overlayLabelColor');

        if (labelColorPicker && labelColorInput) {
            console.log('[Color Picker] Label color picker initialized');

            labelColorPicker.addEventListener('input', function() {
                labelColorInput.value = this.value;
                console.log('[Color Picker] Label color changed to:', this.value);
            });

            labelColorPicker.addEventListener('change', function() {
                var settings = settingStorageController.saveSettings(currentChromeTabId, true);
                reportController.updateReportOverlay(currentChromeTabId, gridToggle.checked,
                    settings.formData.reportForm.settings, settings.formData.advancedForm.settings);
                console.log('[Color Picker] Report overlay updated with new label color');
            });
        }

        // Text Color Picker
        var textColorPicker = document.getElementById('overlayTextColorPicker');
        var textColorInput = document.getElementById('overlayTextColor');

        if (textColorPicker && textColorInput) {
            console.log('[Color Picker] Text color picker initialized');

            textColorPicker.addEventListener('input', function() {
                textColorInput.value = this.value;
                console.log('[Color Picker] Text color changed to:', this.value);
            });

            textColorPicker.addEventListener('change', function() {
                var settings = settingStorageController.saveSettings(currentChromeTabId, true);
                reportController.updateReportOverlay(currentChromeTabId, gridToggle.checked,
                    settings.formData.reportForm.settings, settings.formData.advancedForm.settings);
                console.log('[Color Picker] Report overlay updated with new text color');
            });
        }

        /**
         * Grid Presets - Apply preset configurations
         */
        var gridPresetsDropdown = document.getElementById('gridPresets');

        if (gridPresetsDropdown) {
            console.log('[Grid Presets] Dropdown initialized');

            gridPresetsDropdown.addEventListener('change', function() {
                var preset = this.value;
                console.log('[Grid Presets] Preset selected:', preset);

                if (preset === '') {
                    console.log('[Grid Presets] Empty selection, ignoring');
                    return; // No preset selected
                }

                var presets = {
                    'bootstrap': {
                        largeColumns: 12,
                        smallColumns: 12,
                        gutters: 30,
                        outterGutters: 30,
                        mobileInnerGutters: 15,
                        mobileOutterGutters: 15,
                        largeWidth: 1170,
                        smallWidth: 768
                    },
                    'material': {
                        largeColumns: 12,
                        smallColumns: 4,
                        gutters: 16,
                        outterGutters: 16,
                        mobileInnerGutters: 16,
                        mobileOutterGutters: 16,
                        largeWidth: 1280,
                        smallWidth: 600
                    },
                    'foundation': {
                        largeColumns: 12,
                        smallColumns: 12,
                        gutters: 20,
                        outterGutters: 20,
                        mobileInnerGutters: 20,
                        mobileOutterGutters: 20,
                        largeWidth: 1200,
                        smallWidth: 640
                    },
                    'tailwind': {
                        largeColumns: 12,
                        smallColumns: 12,
                        gutters: 16,
                        outterGutters: 16,
                        mobileInnerGutters: 8,
                        mobileOutterGutters: 8,
                        largeWidth: 1280,
                        smallWidth: 640
                    },
                    '960gs': {
                        largeColumns: 12,
                        smallColumns: 12,
                        gutters: 20,
                        outterGutters: 10,
                        mobileInnerGutters: 10,
                        mobileOutterGutters: 10,
                        largeWidth: 960,
                        smallWidth: 768
                    }
                };

                var selectedPreset = presets[preset];

                if (selectedPreset) {
                    console.log('[Grid Presets] Applying preset configuration:', selectedPreset);

                    // Apply preset values to form inputs
                    document.getElementById('largeColumns').value = selectedPreset.largeColumns;
                    document.getElementById('smallColumns').value = selectedPreset.smallColumns;
                    document.getElementById('gutters').value = selectedPreset.gutters;
                    document.getElementById('outterGutters').value = selectedPreset.outterGutters;
                    document.getElementById('mobileInnerGutters').value = selectedPreset.mobileInnerGutters;
                    document.getElementById('mobileOutterGutters').value = selectedPreset.mobileOutterGutters;
                    document.getElementById('largeWidth').value = selectedPreset.largeWidth;
                    document.getElementById('smallWidth').value = selectedPreset.smallWidth;

                    console.log('[Grid Presets] Form values updated');

                    // Save settings and update grid
                    var settings = settingStorageController.saveSettings(currentChromeTabId, true);
                    console.log('[Grid Presets] Settings saved to storage');

                    gridController.updateGrid(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
                    reportController.calculateReport(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
                    console.log('[Grid Presets] Grid and report updated');

                    // Reset dropdown
                    this.value = '';
                    console.log('[Grid Presets] Dropdown reset');
                } else {
                    console.error('[Grid Presets] Preset not found:', preset);
                }
            });
        } else {
            console.error('[Grid Presets] Dropdown element not found!');
        }

    };

    /**
     * Return the publicly accessible methods
     */
    return {
        init: init
    }

})();
