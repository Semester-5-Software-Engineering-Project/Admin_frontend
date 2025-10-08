'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Protected from '@/components/auth/Protected';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { Users, Shield, Settings, Activity } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export default function AdminPanelPage() {
  const managementTiles = [
    {
      title: 'User Management',
      description: 'View & manage platform admins, tutors, and students.',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Access Control',
      description: 'Assign roles, elevate privileges, revoke access.',
      icon: Shield,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      title: 'Platform Settings',
      description: 'Configure global preferences and security policies.',
      icon: Settings,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'System Activity',
      description: 'Audit logs & recent elevated actions.',
      icon: Activity,
      color: 'text-rose-600',
      bg: 'bg-rose-50'
    }
  ];

  return (
    <Protected roles={['ADMIN','SUPER_ADMIN']} redirect="/dashboard">
      <DashboardLayout>
        <div className="space-y-8">
          <Card className="bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white border-gray-700 shadow-xl">
            <CardContent className="p-10">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-display font-bold mb-3 bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">Admin Control Center</h1>
                  <p className="text-gray-300 max-w-2xl font-medium">Central hub for elevated administration tasks. Only users with appropriate roles can access and perform changes here.</p>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <Badge variant="warning" size="sm">Restricted Area</Badge>
                    <Badge variant="info" size="sm">Role Based</Badge>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <Link href="/admin/create" className="inline-block">
                    <Button variant="primary">Create Admin</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {managementTiles.map(tile => {
              const Icon = tile.icon;
              return (
                <Card key={tile.title} hoverable className="group hover:shadow-lg transition-all">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold text-black group-hover:text-yellow-600 transition-colors">{tile.title}</CardTitle>
                    <div className={`p-2 rounded-lg ${tile.bg} group-hover:scale-110 transition-transform`}>
                      <Icon size={20} className={tile.color} />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">{tile.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 font-medium mb-2">More granular admin tools coming soon.</p>
              <p className="text-sm text-gray-500 font-medium">(Role creation, audit log feed, impersonation, advanced security reports)</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </Protected>
  );
}
