import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface LibraryLayoutProps {
    children: ReactNode;
    header?: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, header, breadcrumbs, ...props }: LibraryLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        <div className="space-y-6">
            {header && (
                <div className="flex items-center justify-between">
                    {header}
                </div>
            )}
            {children}
        </div>
    </AppLayoutTemplate>
);
