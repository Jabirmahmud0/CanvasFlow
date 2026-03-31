import { createPortal } from 'react-dom';

const Portal = ({ children, selector = '#portal-root' }) => {
  const portalRoot = document.querySelector(selector) || document.body;
  return createPortal(children, portalRoot);
};

export default Portal;
