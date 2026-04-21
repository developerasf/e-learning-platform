import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
      <Link to="/" className="hover:text-violet-600 dark:hover:text-violet-400 flex items-center">
        <Home className="w-4 h-4" />
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          <ChevronRight className="w-4 h-4" />
          {item.link ? (
            <Link 
              to={item.link} 
              className="hover:text-violet-600 dark:hover:text-violet-400"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumbs;