import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    Globe,
    Home,
    Inbox,
    LayoutGrid,
    ListChecks,
    Mail,
    MapPin,
    Newspaper,
    Plus,
    Tags,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { home } from '@/routes';
import admin from '@/routes/admin';
import owner from '@/routes/owner';
import type { NavItem } from '@/types';

/* ── Admin menu ───────────────────────────────────────────── */

const adminOverview: NavItem[] = [
    {
        title: 'Dashboard',
        href: admin.dashboard(),
        icon: LayoutGrid,
        exact: true,
    },
];

// Built inside the component so the "Properties" badge can show the pending count
const adminListings = (pendingCount: number): NavItem[] => [
    {
        title: 'Properties',
        href: admin.properties.index(),
        icon: Building2,
        badge: pendingCount,
    },
    { title: 'Areas', href: admin.areas.index(), icon: MapPin },
    { title: 'Categories', href: admin.categories.index(), icon: Tags },
    { title: 'Features', href: admin.features.index(), icon: ListChecks },
];

const adminLeads: NavItem[] = [
    { title: 'Inquiries', href: admin.inquiries.index(), icon: Inbox },
    { title: 'Messages', href: admin.messages.index(), icon: Mail },
    { title: 'Subscribers', href: admin.subscribers.index(), icon: Newspaper },
];

/* ── Property owner menu ──────────────────────────────────── */

const ownerItems: NavItem[] = [
    {
        title: 'My properties',
        href: owner.properties.index(),
        icon: Home,
        exact: true,
    },
    {
        title: 'Post a property',
        href: owner.properties.create(),
        icon: Plus,
    },
];

const footerItems: NavItem[] = [
    { title: 'View website', href: home(), icon: Globe },
];

/**
 * Sidebar of the logged-in area. The admin sees the admin menu,
 * property owners see "My properties".
 */
export function AppSidebar() {
    const { auth, pendingCount } = usePage().props;
    const isAdmin = !!auth.user?.is_admin;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href={
                                    isAdmin
                                        ? admin.dashboard()
                                        : owner.properties.index()
                                }
                                prefetch
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {isAdmin ? (
                    <>
                        <NavMain label="Overview" items={adminOverview} />
                        <NavMain
                            label="Listings"
                            items={adminListings(pendingCount)}
                        />
                        <NavMain label="Leads" items={adminLeads} />
                    </>
                ) : (
                    <NavMain label="My account" items={ownerItems} />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
