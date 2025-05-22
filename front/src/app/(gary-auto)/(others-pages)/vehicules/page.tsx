'use client';
import React from 'react';
import BasicTableOne from '@/components/tables/VehiculesTable';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';

export default function MesVehiculesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <BasicTableOne />
    </div>
  );
}
