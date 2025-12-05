export const designSystem = {
  systemName: "Design System",
  version: "1.0.0",
  theme: "Dark Mode",
  colorPalette: {
    backgrounds: {
      appBg: "#1e2029",
      headerBg: "#252735",
      cardBg: "#252735",
      inputBg: "#2f3245",
      dropdownBg: "#2f3245"
    },
    primary: {
      main: "#6d6bfb",
      hover: "#5a58e0",
      textOnPrimary: "#ffffff"
    },
    secondary: {
      main: "#3f4258",
      textOnSecondary: "#ffffff"
    },
    status: {
      successBg: "rgba(40, 199, 111, 0.15)",
      successText: "#28c76f",
      dangerBg: "rgba(234, 84, 85, 0.15)",
      dangerText: "#ea5455",
      dangerSolidBg: "#ea5455",
      warningGradientStart: "#ff9f43",
      warningGradientEnd: "#ff6b6b"
    },
    text: {
      primary: "#d0d2d6",
      secondary: "#b4b7bd",
      muted: "#676d7d",
      white: "#ffffff"
    },
    borders: {
      divider: "#3b4253",
      inputBorder: "transparent"
    }
  },
  typography: {
    fontFamily: "'Inter', 'Public Sans', sans-serif",
    hierarchy: {
      h1Logo: {
        size: "24px",
        weight: "700",
        color: "#ffffff"
      },
      sectionHeader: {
        size: "18px",
        weight: "600",
        color: "#d0d2d6"
      },
      bodyText: {
        size: "14px",
        weight: "400",
        color: "#b4b7bd"
      },
      tableHeader: {
        size: "12px",
        weight: "600",
        transform: "uppercase",
        letterSpacing: "1px",
        color: "#b4b7bd"
      },
      buttonText: {
        size: "14px",
        weight: "500"
      }
    }
  },
  spacingAndLayout: {
    gridSystem: "Fluid container with padding",
    spacing: {
      xs: "4px",
      sm: "8px",
      md: "16px",
      lg: "24px",
      xl: "32px"
    },
    borderRadius: {
      sm: "4px",
      md: "6px",
      lg: "8px",
      pill: "50px"
    },
    elevation: {
      cardShadow: "0 4px 24px 0 rgba(0, 0, 0, 0.25)",
      headerShadow: "0 2px 10px 0 rgba(0, 0, 0, 0.1)"
    }
  },
  components: {
    buttons: {
      primary: {
        background: "#6d6bfb",
        color: "#ffffff",
        borderRadius: "6px",
        padding: "10px 20px",
        boxShadow: "0 4px 14px 0 rgba(109, 107, 251, 0.4)"
      },
      ghost: {
        background: "transparent",
        border: "1px solid #3f4258",
        color: "#d0d2d6",
        borderRadius: "6px"
      },
      iconOnly: {
        background: "transparent",
        color: "#b4b7bd"
      }
    },
    inputs: {
      textField: {
        background: "#2f3245",
        border: "1px solid #3b4253",
        borderRadius: "6px",
        padding: "10px 14px",
        textColor: "#d0d2d6"
      },
      select: {
        background: "#2f3245",
        borderRadius: "6px",
        textColor: "#d0d2d6"
      }
    },
    alerts: {
      dangerBar: {
        background: "linear-gradient(90deg, #ea5455, #ff6b6b)",
        color: "#ffffff",
        borderRadius: "4px",
        padding: "12px",
        fontWeight: "600"
      },
      infoBar: {
        background: "linear-gradient(90deg, #ff9f43, #ff6b6b)",
        color: "#ffffff",
        borderRadius: "4px",
        padding: "8px 12px"
      }
    },
    table: {
      headerBg: "transparent",
      rowBg: "transparent",
      rowBorderBottom: "1px solid #3b4253",
      cellPadding: "16px"
    },
    badges: {
      statusPill: {
        padding: "4px 10px",
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: "600",
        textTransform: "uppercase"
      }
    }
  }
};

export type DesignSystem = typeof designSystem;