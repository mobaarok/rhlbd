import {
    AirVent,
    ArrowUpDown,
    BedSingle,
    Briefcase,
    Building,
    Building2,
    Car,
    Cctv,
    CircleCheck,
    Dumbbell,
    Flame,
    Gem,
    Home,
    PawPrint,
    ShieldCheck,
    Sofa,
    Store,
    Sun,
    Trees,
    Waves,
    Wifi,
    Zap,
} from 'lucide-react';
import type { LucideIcon, LucideProps } from 'lucide-react';

/**
 * Icons that admins can pick by name for categories and features.
 * The name is stored in the database (e.g. categories.icon = "sofa").
 *
 * To support a new icon: import it above and add it to this map.
 * Browse icons at https://lucide.dev/icons
 */
export const ICONS: Record<string, LucideIcon> = {
    'air-vent': AirVent,
    'arrow-up-down': ArrowUpDown,
    'bed-single': BedSingle,
    briefcase: Briefcase,
    building: Building,
    'building-2': Building2,
    car: Car,
    cctv: Cctv,
    dumbbell: Dumbbell,
    flame: Flame,
    gem: Gem,
    home: Home,
    'paw-print': PawPrint,
    'shield-check': ShieldCheck,
    sofa: Sofa,
    store: Store,
    sun: Sun,
    trees: Trees,
    waves: Waves,
    wifi: Wifi,
    zap: Zap,
};

/** All icon names, used for the icon <select> in the admin panel. */
export const ICON_NAMES = Object.keys(ICONS).sort();

type Props = Omit<LucideProps, 'name'> & {
    /** Icon name from the database, e.g. "wifi". Unknown names show a check mark. */
    name: string | null | undefined;
};

/**
 * Render a Lucide icon by its name.
 *
 * Example: <DynamicIcon name="wifi" className="size-4" />
 */
export function DynamicIcon({ name, ...props }: Props) {
    const Icon = (name && ICONS[name]) || CircleCheck;

    return <Icon {...props} />;
}
