import { Variants } from "framer-motion";

// Fade in animation
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Slide up animation
export const slideUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 10 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.2 }
  }
};

// Slide in from left
export const slideInLeft: Variants = {
  hidden: { 
    x: -20, 
    opacity: 0 
  },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: {
    x: -20,
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Slide in from right
export const slideInRight: Variants = {
  hidden: { 
    x: 20, 
    opacity: 0 
  },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: {
    x: 20,
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Scale animation
export const scale: Variants = {
  hidden: { 
    scale: 0.95, 
    opacity: 0 
  },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Pop animation for micro-interactions
export const pop: Variants = {
  hidden: { 
    scale: 0.9, 
    opacity: 0 
  },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 17 
    }
  },
  tap: {
    scale: 0.97,
    transition: { 
      duration: 0.1 
    }
  },
  hover: {
    scale: 1.03,
    transition: { 
      duration: 0.2 
    }
  }
};

// Staggered children animation
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07
    }
  }
};

// Animation for staggered list items
export const listItem: Variants = {
  hidden: { 
    opacity: 0, 
    y: 10 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 24
    }
  }
};

// Pulse animation for loading states
export const pulse: Variants = {
  hidden: { 
    opacity: 0.6 
  },
  visible: { 
    opacity: 1,
    transition: { 
      repeat: Infinity, 
      repeatType: "reverse", 
      duration: 0.8 
    }
  }
};

// Modal animation
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2
    }
  }
};

// Backdrop animation for modals
export const backdropVariants: Variants = {
  hidden: { 
    opacity: 0 
  },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.2 
    }
  },
  exit: {
    opacity: 0,
    transition: { 
      delay: 0.1,
      duration: 0.2 
    }
  }
};

// Toast notification animation
export const toastVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 50, 
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: "spring", 
      damping: 20, 
      stiffness: 300
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { 
      duration: 0.2 
    }
  }
};

// Hover effects for cards
export const cardHover = {
  hover: {
    y: -4,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
    transition: { duration: 0.2 }
  },
  tap: {
    y: 0,
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
    transition: { duration: 0.1 }
  }
};

// Sidebar animation for mobile
export const sidebarVariants: Variants = {
  hidden: {
    x: "-100%",
    transition: {
      type: "tween",
      duration: 0.3
    }
  },
  visible: {
    x: 0,
    transition: {
      type: "tween",
      duration: 0.3
    }
  }
};

// Chevron rotate animation
export const chevronVariants: Variants = {
  closed: { rotate: 0 },
  open: { rotate: 180 }
};

// For micro-interactions and loading states
export const loadingDots: Variants = {
  hidden: {
    opacity: 0,
    transition: {
      staggerChildren: 0.2
    }
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export const dotVariant: Variants = {
  hidden: {
    y: 0,
    opacity: 0.5
  },
  visible: {
    y: [0, -5, 0],
    opacity: 1,
    transition: {
      y: {
        repeat: Infinity,
        duration: 0.6
      }
    }
  }
};
