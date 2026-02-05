const React = require('react');

const componentCache = {};

const createMotionComponent = (element) => {
  if (!componentCache[element]) {
    const Component = React.forwardRef((props, ref) => {
      const {
        initial, animate, exit, variants, whileHover, whileTap, whilePress,
        transition, layout, layoutId, layoutDependency, layoutScroll,
        ...rest
      } = props;
      return React.createElement(element, { ...rest, ref });
    });
    Component.displayName = `motion.${element}`;
    componentCache[element] = Component;
  }
  return componentCache[element];
};

const motion = new Proxy({}, {
  get: (_, element) => createMotionComponent(element),
});

const AnimatePresence = ({ children }) => children;

module.exports = { motion, AnimatePresence };
