# Design Grid Overlay (Enhanced)

A Chrome extension to overlay a design grid on your web page; configurable to fit many design scenarios.

**This is a modernized fork** of the original [eBay Design Grid Overlay](https://github.com/eBay/Design-Grid-Overlay) (now archived), updated to work with **Manifest V3** and enhanced with new features.

## 🆕 What's New in This Fork

### Manifest V3 Migration
- ✅ Fully compatible with Chrome's latest extension requirements
- ✅ Updated all deprecated APIs (`chrome.extension.*` → `chrome.runtime.*`)
- ✅ Migrated to service workers
- ✅ Promise-based error handling for all message passing

### New Features
- 🎨 **Grid Opacity Slider** - Adjust grid transparency from 0-100% in real-time
- ⚡ **Grid Presets** - Quick setup for popular frameworks:
  - Bootstrap (12 cols, 30px gutters)
  - Material Design (12 cols, 16px gutters)
  - Foundation (12 cols, 20px gutters)
  - Tailwind CSS (12 cols, 16px gutters)
  - 960 Grid System (12 cols, 20px gutters)
- 🎨 **Color Pickers** - Visual color selection for all grid and label colors
- 🎯 **Enhanced UI** - Beautiful gradient-styled sections with improved visibility
- 🐛 **Bug Fixes** - Resolved all console errors and connection issues

## Installation

### From Source (Developer Mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/zaman-shakir/Design-Grid-Overlay.git
   ```
   Or download as [ZIP](https://github.com/zaman-shakir/Design-Grid-Overlay/archive/master.zip)

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable **Developer mode** (toggle in top-right corner)

4. Click **Load unpacked** and select the extension folder

5. The extension icon should appear in your Chrome toolbar

## Usage

### Activation
- **Click** the extension icon in toolbar
- **Keyboard Shortcuts:**
  - Mac: `Command + Shift + A` (Activate extension)
  - Windows: `Ctrl + Shift + A` (Activate extension)
  - Mac/Windows: `Command/Ctrl + Shift + K` (Toggle Vertical Grid)
  - Mac/Windows: `Command/Ctrl + Shift + H` (Toggle Horizontal Grid)

### Quick Start with Presets
1. Open the extension popup
2. Go to **Settings** tab
3. Select a preset from the dropdown (Bootstrap, Material Design, etc.)
4. Toggle the grid on/off with the switches at the top

### Customization
- **Grid Opacity**: Use the slider in Advanced tab to adjust transparency
- **Colors**: Click color pickers next to each color field for visual selection
- **Columns**: Set different column counts for large and small screens
- **Gutters**: Configure inner/outer spacing for vertical and horizontal grids
- **Offset**: Fine-tune grid positioning with X/Y offset controls

### Tips
- Hold **Shift** while using number inputs to increment/decrement by 10
- Use the **Report** tab to measure element widths on the page
- Enable **Content Width Labels** to visualize element dimensions

## Features

### Core Grid System
- Customizable column counts for large/small breakpoints
- Independent gutter settings for desktop and mobile
- Horizontal baseline grid overlay
- Responsive grid that adapts to screen sizes
- X/Y offset controls for precise positioning

### Visual Customization
- Adjustable grid opacity (0-100%)
- Custom colors for grid columns and horizontal lines
- Color pickers for easy color selection
- Content width label customization

### Measurement Tools
- Element width reporting with CSS selectors
- Column width calculations
- Content width labels overlay
- Empty element detection

### Advanced Options
- Viewport-based centering (ignores scrollbar)
- Hidden element overlay filtering
- Custom color support (hex, rgb, rgba, hsl)

## Original Credits

### Created by eBay (Original Version)
- Anthony Topper
- Chris Norman
- James Skorupski
- Aaron Kleinsteiber
- Mikhail Panichev
- An-Ni Wang

Props to [Carl Henderson](https://github.com/chuckhendo) whose [Chrome Bootstrap project](https://github.com/chuckhendo/chrome-bootstrap) was the original inspiration.

### Enhanced Fork by
**Shakir Zaman** (2025)
- GitHub: [@zaman-shakir](https://github.com/zaman-shakir)
- Email: zaman.shakirdev@gmail.com

## Changelog

### Version 1.1.0 (2025)
- ✅ Migrated to Manifest V3
- ✅ Added Grid Opacity Slider
- ✅ Added Grid Presets (5 popular frameworks)
- ✅ Added Color Pickers for all color settings
- ✅ Enhanced UI with gradient styling
- ✅ Fixed all console errors and Promise rejections
- ✅ Updated deprecated Chrome extension APIs
- ✅ Improved error handling throughout
- ✅ Fixed Screen Sizes input width to 100%

### Version 1.0.0 (Original by eBay)
- Original Design Grid Overlay features

## License

MIT License - See [LICENSE](LICENSE) file for details.

This project is a fork of the original eBay Design Grid Overlay (archived). Both the original work and this enhanced version are under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

### Development Setup
1. Fork this repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly in Chrome
5. Submit a pull request

## Support

If you encounter any issues or have feature requests, please [open an issue](https://github.com/zaman-shakir/Design-Grid-Overlay/issues).

---

**Note:** This extension is not affiliated with or endorsed by eBay Inc. It is an independent fork of their archived open-source project.
