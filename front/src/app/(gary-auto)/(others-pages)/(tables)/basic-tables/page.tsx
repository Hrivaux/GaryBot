'use client';
import React from 'react';
import BasicTableOne from '@/components/tables/BasicTableOne';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';

export default function MesVehiculesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <PageBreadcrumb pageTitle="Mes véhicules" />
      <BasicTableOne />
    </div>
  );
}
