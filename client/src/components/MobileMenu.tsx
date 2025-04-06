import { useEffect } from 'react';
import { useAccessibilitySettings } from '../hooks/useAccessibilitySettings';

type FontFamily = 'roboto' | 'opendyslexic' | 'arial';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const fontOptions: FontFamily[] = ['opendyslexic', 'roboto', 'arial'];

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { theme, toggleTheme, fontFamily, setFontFamily } = useAccessibilitySettings();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const isFontFamily = (value: string): value is FontFamily => {
    return fontOptions.includes(value as FontFamily);
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFont = e.target.value;
    if (isFontFamily(selectedFont)) {
      setFontFamily(selectedFont);
    }
  };

  return (
    <div 
      id="mobile-menu" 
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${isOpen ? '' : 'hidden'}`} 
      aria-hidden={!isOpen}
    >
      <div 
        className={`bg-white w-72 h-full shadow-xl transform transition-transform ease-in-out duration-300 ${isOpen ? '' : '-translate-x-full'}`}
      >
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Menu</h2>
            <button 
              id="close-mobile-menu" 
              className="p-3 rounded-full hover:bg-gray-100 focus:bg-gray-100 transition" 
              aria-label="Close Menu"
              onClick={onClose}
            >
              <i className="fas fa-times text-2xl text-gray-700"></i>
            </button>
          </div>
        </div>
        <div className="p-5">
          <nav>
            <ul className="space-y-4">
              <li>
                <a 
                  href="#" 
                  className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-lg text-gray-800"
                >
                  <span className="mr-3">📝</span> Text Tools
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-lg text-gray-800"
                >
                  <span className="mr-3">🤖</span> Chat Assistant
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-lg text-gray-800"
                >
                  <span className="mr-3">⚙️</span> Settings
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-lg text-gray-800"
                >
                  <span className="mr-3">❓</span> Help &amp; Support
                </a>
              </li>
            </ul>
          </nav>
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Accessibility</h3>
            <div className="space-y-6">
              {/* Dark Mode Toggle */}
              <div>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-lg text-gray-800">Dark Mode</span>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      id="mobile-dark-mode" 
                      className="sr-only"
                      checked={theme === 'dark'}
                      onChange={toggleTheme}
                    />
                    <div className={`w-12 h-6 ${theme === 'dark' ? 'bg-green-600' : 'bg-gray-300'} rounded-full transition`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${theme === 'dark' ? 'translate-x-6' : ''}`}></div>
                  </div>
                </label>
              </div>
              {/* Font Family Selector */}
              <div>
                <label htmlFor="mobile-font-select" className="block mb-2 text-lg text-gray-800">Font</label>
                <select 
                  id="mobile-font-select" 
                  className="w-full p-3 border border-gray-300 rounded-lg text-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
                  value={fontFamily}
                  onChange={handleFontChange}
                >
                  {fontOptions.map((font) => (
                    <option key={font} value={font}>
                      {font.charAt(0).toUpperCase() + font.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
