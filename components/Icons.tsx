
import React from 'react';
import {
  Home as HomeIcon,
  User as UserIcon,
  Settings as SettingsIcon,
  FileText as FileTextIcon,
  HelpCircle as HelpCircleIcon,
  CreditCard as CreditIcon,
  LogOut as LogoutIcon,
  Search as SearchIcon,
  Bell as BellIcon,
  DollarSign as DollarSignIcon,
  Menu as MenuIcon,
  X as XIcon,
  ChevronDown as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
  Sparkles as SparklesIcon,
  Instagram as InstagramIcon,
  Plus as PlusIcon,
  Globe as GlobeIcon,
  Trash as TrashIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  RefreshCw as RefreshCwIcon,
  ExternalLink as ExternalLinkIcon,
  Send as SendIcon,
  Eye as EyeIcon,
  Loader2 as SpinnerIcon,
  Upload as UploadIcon,
  Wand2 as MagicWandIcon,
  Loader as LoaderIcon,
  AlertTriangle as AlertTriangleIcon,
  ChevronLeft as ChevronLeftIcon,
  Camera as CameraIcon,
  Clock as ClockIcon,
  Check as CheckIcon,
  Plug as PlugIcon,
  BrainCircuit as BrainCircuitIcon,
  Key as KeyIcon,
  EyeOff as EyeOffIcon,
  Users as UsersIcon,
  Mail as MailIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  Book as BookIcon,
  ClipboardList as ClipboardListIcon,
  Copy as CopyIcon,
  Rocket as RocketIcon,
  ChevronUp as ChevronUpIcon,
  TrendingUp as TrendingUpIcon,
  Link as LinkIcon,
  ShoppingCart as ShoppingCartIcon,
  Shield as ShieldIcon,
  Image as ImageIcon,
  ShieldCheck as ShieldCheckIcon,
  Receipt as ReceiptIcon,
  CreditCard as CreditCardIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  Square as StopIcon,
  LayoutDashboard as DashboardIcon,
  UserPlus as UserPlusIcon,
  Crown as CrownIcon,
  Smartphone as SmartphoneIcon,
  Shirt as ShirtIcon,
  Keyboard as KeyboardIcon,
  Dumbbell as DumbbellIcon,
  MessageSquare as ChatIcon,
  UserSearch as UserSearchIcon
} from 'lucide-react';

// Custom Icons

export const TelegramIcon = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

export const WhatsAppIcon = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

export const ShopeeIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" {...props}>
    <path d="M4 6h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" />
    <path d="M8 6V4a4 4 0 0 1 8 0v2" />
    <path d="M11 12h2" />
  </svg>
);

export const AmazonIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" {...props}>
    <path d="M21 16.5c-2.5 2.5-6 3-9 3-4 0-7-2-9-5" />
    <path d="M16 10l3-3 3 3" />
  </svg>
);

export const MercadoLivreIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" {...props}>
    <path d="M3 9l9-6 9 6v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);


export const WooCommerceIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" {...props}>
    <path d="M9 12l2 2 4-4" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);

export const WordPressIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 2a8 8 0 0 0-8 8c0 1.728.55 3.325 1.486 4.634l.054.07.054-.07C7.675 15.325 9.272 14.775 11 14.775s3.325.55 4.634 1.486l.07.054-.07.054C14.325 17.675 12.728 18.225 11 18.225s-3.325-.55-4.634-1.486l-.054-.07-.054.07C4.325 15.325 2.775 13.728 2.775 12c0-4.418 3.582-8 8-8s8 3.582 8 8c0 1.728-.55 3.325-1.486 4.634l-.054.07-.054-.07C16.325 15.325 14.728 14.775 13 14.775s-3.325.55-4.634 1.486l-.07.054.07.054C9.675 17.675 11.272 18.225 13 18.225s3.325-.55 4.634-1.486l.054-.07.054.07C19.675 15.325 21.225 13.728 21.225 12c0-4.418-3.582-8-8-8z" />
  </svg>
);

export const OpenAIIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" {...props}>
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
  </svg>
);

export const PixIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" {...props}>
    <path d="M12 2L2 12l10 10 10-10L12 2z" />
    <path d="M12 6l-6 6 6 6 6-6-6-6z" />
  </svg>
);

export const ShoppingCartSendIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" {...props}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    <path d="M16 11l2-2 4 4" />
  </svg>
);

export const XCircleIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);

export {
  HomeIcon,
  UserIcon,
  SettingsIcon,
  FileTextIcon,
  HelpCircleIcon,
  CreditIcon,
  LogoutIcon,
  SearchIcon,
  BellIcon,
  DollarSignIcon,
  MenuIcon,
  XIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SparklesIcon,
  InstagramIcon,
  PlusIcon,
  GlobeIcon,
  TrashIcon,
  EditIcon,
  CheckCircleIcon,
  // XCircleIcon, // Defined manually above to ensure it exists or imported if available
  RefreshCwIcon,
  ExternalLinkIcon,
  SendIcon,
  EyeIcon,
  SpinnerIcon,
  UploadIcon,
  MagicWandIcon,
  LoaderIcon,
  AlertTriangleIcon,
  ChevronLeftIcon,
  CameraIcon,
  ClockIcon,
  CheckIcon,
  PlugIcon,
  BrainCircuitIcon,
  KeyIcon,
  EyeOffIcon,
  UsersIcon,
  MailIcon,
  LockIcon,
  PhoneIcon,
  BookIcon,
  ClipboardListIcon,
  CopyIcon,
  RocketIcon,
  ChevronUpIcon,
  TrendingUpIcon,
  LinkIcon,
  ShoppingCartIcon,
  ShieldIcon,
  ImageIcon,
  ShieldCheckIcon,
  ReceiptIcon,
  CreditCardIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  DashboardIcon,
  UserPlusIcon,
  CrownIcon,
  SmartphoneIcon,
  ShirtIcon,
  KeyboardIcon,
  DumbbellIcon,
  ChatIcon,
  UserSearchIcon
};

// Google Icon (Custom SVG)
export const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

// Contact Support Icon (Phone + Email)
export const ContactSupportIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z" />
    <path d="M352 96h144c8.8 0 16 7.2 16 16v224c0 8.8-7.2 16-16 16H352V96zm0 288h144c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H352c-8.8 0-16 7.2-16 16v288c0 8.8 7.2 16 16 16zm32-224l80 64-80 64V160z" />
  </svg>
);

// Browser Window Icon
export const BrowserWindowIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM48 368v48c0 8.8 7.2 16 16 16H448c8.8 0 16-7.2 16-16V368H48zm416-48V153.6H48V320H464zM64 80c-8.8 0-16 7.2-16 16v25.6H464V96c0-8.8-7.2-16-16-16H64zM88 104a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm72 0a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm72 0a24 24 0 1 1 0 48 24 24 0 1 1 0-48zM128 208H384v32H128V208zm0 64H384v32H128V272z" />
  </svg>
);

// Launch/Start Icon
export const LaunchIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z" />
    <path d="M505.1 19.1C503 8.6 492.6 2 482.9 2.2c-37.9 .8-74.4 15.4-101.8 42.8L320 106.1V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H342.1l61.1-61.1c18.4-18.4 43.3-28.6 69.5-28.5c5.8 .1 11.5 .6 17.1 1.6c9.1 1.6 17.9-3.6 21.1-12.3zM435 299.5c17.7 0 32-14.3 32-32V171.4l63.4 63.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L457.4 71.2c-18.4-18.4-43.3-28.6-69.5-28.5c-5.8 .1-11.5 .6-17.1 1.6c-9.1 1.6-17.9-3.6-21.1-12.3L347.3 19.1C345.2 8.6 334.8 2 325.1 2.2c-37.9 .8-74.4 15.4-101.8 42.8L147.3 121V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H169.4l62.3-62.3c18.4-18.4 43.3-28.6 69.5-28.5c5.8 .1 11.5 .6 17.1 1.6c9.1 1.6 17.9-3.6 21.1-12.3l2.4-7.1c2.1-10.5 12.5-17.1 22.2-16.9c37.9 .8 74.4 15.4 101.8 42.8L507.3 87.2c25.3 25.3 36.9 58.9 38.6 92.4c.2 9.7-6.4 19.9-16 22.1l-7.1 2.4c-8.7 3.2-13.9 12-12.3 21.1c1 5.6 1.5 11.3 1.6 17.1 .1 26.2-10.1 51.1-28.5 69.5l-62.3 62.3H371.4c-17.7 0-32 14.3-32 32s14.3 32 32 32h96z" opacity="0.3" />
  </svg>
);

// Award/Badge Icon
export const AwardBadgeIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.1 38.2C1.4 34.2 0 29.4 0 24.6C0 11 11 0 24.6 0H133.9c11.2 0 21.7 5.9 27.4 15.5l68.5 114.1c-48.2 6.1-91.3 28.6-123.4 61.9L4.1 38.2zm503.7 0L405.6 191.5c-32.1-33.3-75.2-55.8-123.4-61.9L350.7 15.5C356.5 5.9 366.9 0 378.1 0H487.4C501 0 512 11 512 24.6c0 4.8-1.4 9.6-4.1 13.6zM80 336a176 176 0 1 1 352 0A176 176 0 1 1 80 336zm184.4-94.9c-3.4-7-13.3-7-16.8 0l-22.4 45.4c-1.4 2.8-4 4.7-7 5.1L168 298.9c-7.7 1.1-10.7 10.5-5.2 16l36.3 35.4c2.2 2.2 3.2 5.2 2.7 8.3l-8.6 49.9c-1.3 7.6 6.7 13.5 13.6 9.9l44.8-23.6c2.7-1.4 6-1.4 8.7 0l44.8 23.6c6.9 3.6 14.9-2.2 13.6-9.9l-8.6-49.9c-.5-3 .5-6.1 2.7-8.3l36.3-35.4c5.6-5.4 2.5-14.8-5.2-16l-50.1-7.3c-3-.4-5.7-2.4-7-5.1l-22.4-45.4z" />
  </svg>
);

// Advertisement Icon
export const AdvertisementIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M64 64C28.7 64 0 92.7 0 128V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H64zM96 160H416c17.7 0 32 14.3 32 32v32c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V192c0-17.7 14.3-32 32-32zm0 128H224c17.7 0 32 14.3 32 32v32c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V320c0-17.7 14.3-32 32-32z" />
    <path d="M352 288l96 80V208l-96 80zm-64-32c0-17.7 14.3-32 32-32h32c17.7 0 32 14.3 32 32v96c0 17.7-14.3 32-32 32H320c-17.7 0-32-14.3-32-32V256z" opacity="0.5" />
  </svg>
);

