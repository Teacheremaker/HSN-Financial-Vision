
'use client';

import * as React from 'react';
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  PaginationState,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  Download,
  Upload,
  FileText,
  PlusCircle,
  MoreHorizontal,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/header';
import type { Entity, ServiceSubscription } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select';
import { Label } from '@/components/ui/label';

const initialData: Entity[] = [
    { id: 'ENT-001', nom: 'Ville de Metropolia', population: 50000, type: 'Fondatrice', statut: 'Actif', services: [{name: 'GEOTER', year: 2022}, {name: 'SPANC', year: 2023}]},
    { id: 'ENT-002', nom: 'Ville de Silverlake', population: 25000, type: 'Utilisatrice', statut: 'Actif', services: [{name: 'GEOTER', year: 2023}] },
    { id: 'ENT-003', nom: 'Village d\'Oakhaven', population: 5000, type: 'Utilisatrice', statut: 'Inactif', services: [] },
    { id: 'ENT-004', nom: 'Arrondissement d\'Ironwood', population: 120000, type: 'Fondatrice', statut: 'Actif', services: [{name: 'GEOTER', year: 2022}, {name: 'SPANC', year: 2022}, {name: 'ROUTE', year: 2024}] },
    { id: 'ENT-005', nom: 'Municipalité de Sunfield', population: 12000, type: 'Utilisatrice', statut: 'Actif', services: [{name: 'SPANC', year: 2024}, {name: 'ADS', year: 2025}] },
    { id: 'ENT-006', nom: 'Ville de Redwood', population: 35000, type: 'Utilisatrice', statut: 'Actif', services: [{name: 'GEOTER', year: 2024}]},
    { id: 'ENT-007', nom: 'Bourg de Greenfield', population: 8000, type: 'Utilisatrice', statut: 'Actif', services: [{name: 'ROUTE', year: 2025}]},
    { id: 'ENT-008', nom: 'Ville de Starfall', population: 62000, type: 'Fondatrice', statut: 'Actif', services: [{name: 'GEOTER', year: 2022}, {name: 'ADS', year: 2023}]},
    { id: 'ENT-009', nom: 'Hameau de Whisperwind', population: 1200, type: 'Utilisatrice', statut: 'Inactif', services: []},
    { id: 'ENT-010', nom: 'Cité de Crystalcreek', population: 95000, type: 'Fondatrice', statut: 'Actif', services: [{name: 'GEOTER', year: 2022}, {name: 'SPANC', year: 2023}, {name: 'ROUTE', year: 2024}, {name: 'ADS', year: 2025}]},
    { id: 'ENT-011', nom: 'Comté de Stonefield', population: 15000, type: 'Utilisatrice', statut: 'Actif', services: [{name: 'SPANC', year: 2024}]},
    { id: 'ENT-012', nom: 'Ville de Moonshadow', population: 22000, type: 'Utilisatrice', statut: 'Actif', services: [{name: 'GEOTER', year: 2023}, {name: 'ADS', year: 2024}]},
    { id: 'ENT-013', nom: 'Village de Riverbend', population: 3000, type: 'Utilisatrice', statut: 'Actif', services: [{name: 'ROUTE', year: 2024}]},
    { id: 'ENT-014', nom: 'Ville de Emberfall', population: 48000, type: 'Utilisatrice', statut: 'Actif', services: [{name: 'GEOTER', year: 2024}]},
    { id: 'ENT-015', nom: 'Paroisse de Summerisle', population: 18000, type: 'Utilisatrice', statut: 'Inactif', services: []},
];

const SERVICE_OPTIONS: MultiSelectOption[] = [
  { value: "GEOTER", label: "GEOTER" },
  { value: "SPANC", label: "SPANC" },
  { value: "ROUTE", label: "ROUTE" },
  { value: "ADS", label: "ADS" },
];

const EditableCell = ({ getValue, row, column, table }) => {
  const initialValue = getValue();
  const tableMeta = table.options.meta;
  const isEditing = tableMeta?.editingRowId === row.id;

  if (!isEditing) {
    if (column.id === 'services') {
      const services = getValue<ServiceSubscription[]>();
      if (!services || services.length === 0) {
        return <span className="text-muted-foreground">Aucun</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {services.map((service) => (
            <Badge key={service.name} variant="secondary" className="font-normal">
              {service.name} ({service.year})
            </Badge>
          ))}
        </div>
      );
    }
    if (column.id === 'statut') {
        const status = getValue<string>();
        return (
            <Badge variant={status === 'Actif' ? 'default' : 'secondary'} className={status === 'Actif' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}>
                {status}
            </Badge>
        );
    }
    return <span>{initialValue}</span>;
  }

  const onUpdate = (value: any) => {
    tableMeta?.updateData(row.index, column.id, value);
  };
  
  switch(column.id) {
    case 'type':
        return (
            <Select value={initialValue} onValueChange={onUpdate}>
                <SelectTrigger className="h-8">
                    <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Fondatrice">Fondatrice</SelectItem>
                    <SelectItem value="Utilisatrice">Utilisatrice</SelectItem>
                </SelectContent>
            </Select>
        )
    case 'statut':
        return (
            <Select value={initialValue} onValueChange={onUpdate}>
                <SelectTrigger className="h-8">
                    <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Actif">Actif</SelectItem>
                    <SelectItem value="Inactif">Inactif</SelectItem>
                </SelectContent>
            </Select>
        )
    case 'services': {
        const currentServices = (initialValue as ServiceSubscription[]) || [];
        const selectedServiceNames = currentServices.map(s => s.name);

        const handleServiceSelectionChange = (newServiceNames: string[]) => {
            const newServices = newServiceNames.map(name => {
                const existingService = currentServices.find(s => s.name === name);
                return existingService || { name: name, year: new Date().getFullYear() };
            });
            onUpdate(newServices);
        };

        const handleYearChange = (serviceName: string, year: string) => {
            const newYear = parseInt(year, 10);
            if (isNaN(newYear) || year.length > 4) return;

            const newServices = currentServices.map(service => 
                service.name === serviceName ? { ...service, year: newYear } : service
            );
            onUpdate(newServices);
        };

        const isSelectOpen = tableMeta?.openSelectId === row.id;
        const setSelectOpen = (open: boolean) => {
            tableMeta?.setOpenSelectId(open ? row.id : null);
        };
        
        return (
            <div className="space-y-2 min-w-[250px]">
                <MultiSelect
                    options={SERVICE_OPTIONS}
                    selected={selectedServiceNames}
                    onChange={handleServiceSelectionChange}
                    className="w-full"
                    placeholder="Sélectionner des services..."
                    open={isSelectOpen}
                    onOpenChange={setSelectOpen}
                />
                <div className="space-y-1 max-h-24 overflow-y-auto pr-2">
                    {currentServices.map((service) => (
                        <div key={service.name} className="flex items-center justify-between gap-2">
                            <Label htmlFor={`service-year-${row.id}-${service.name}`} className="text-xs font-medium text-muted-foreground">
                                {service.name}
                            </Label>
                            <Input
                                id={`service-year-${row.id}-${service.name}`}
                                type="number"
                                value={service.year}
                                onChange={(e) => handleYearChange(service.name, e.target.value)}
                                className="h-7 w-20 text-xs"
                                placeholder="Année"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    default:
        return <Input className="h-8" value={initialValue} onChange={(e) => onUpdate(e.target.value)} type={typeof initialValue === 'number' ? 'number' : 'text'} />;
  }
};

const generateCsv = (data: Entity[]): string => {
    const headers = ['nom', 'population', 'type', 'statut', 'services'];
    const csvRows = [headers.join(',')];
    const quote = (field: any) => {
        const stringField = String(field);
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
            return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
    };

    data.forEach(entity => {
        const servicesString = entity.services.map(s => `${s.name}:${s.year}`).join(';');
        const row = [
            quote(entity.nom),
            quote(entity.population),
            quote(entity.type),
            quote(entity.statut),
            quote(servicesString)
        ].join(',');
        csvRows.push(row);
    });

    return csvRows.join('\n');
};

const parseCsv = (csvText: string): Entity[] => {
    const lines = csvText.trim().split('\n').filter(line => !line.startsWith('#') && line.trim() !== '');
    const headerLine = lines.shift();
    if (!headerLine) return [];

    const headers = headerLine.split(',').map(h => h.trim());

    return lines.map(line => {
        const values = (line.match(/(".*?"|[^,]*)(,|$)/g) || [])
            .map(v => v.endsWith(',') ? v.slice(0, -1) : v)
            .map(v => v.trim())
            .map(v => {
                if (v.startsWith('"') && v.endsWith('"')) {
                    return v.slice(1, -1).replace(/""/g, '"');
                }
                return v;
            });
        
        const rowData = headers.reduce((obj, header, index) => {
            obj[header] = values[index] || '';
            return obj;
        }, {} as Record<string, any>);

        const services: ServiceSubscription[] = (rowData.services || '')
            .split(';')
            .filter(Boolean)
            .map((s: string) => {
                const [name, year] = s.split(':');
                return { name: name?.trim(), year: parseInt(year, 10) };
            })
            .filter((s: ServiceSubscription) => s.name && !isNaN(s.year));

        return {
            id: rowData.id || `ENT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            nom: rowData.nom || 'Sans Nom',
            population: parseInt(rowData.population as any, 10) || 0,
            type: rowData.type === 'Fondatrice' ? 'Fondatrice' : 'Utilisatrice',
            statut: rowData.statut === 'Actif' ? 'Actif' : 'Inactif',
            services: services,
        };
    });
};


export default function EntitiesPage() {
  const [data, setData] = React.useState(initialData);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [editingRowId, setEditingRowId] = React.useState<string | null>(null);
  const [openSelectId, setOpenSelectId] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const csvString = generateCsv(data);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "entites.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportTemplate = () => {
    const headers = "nom,population,type,statut,services";
    const example = "# La colonne 'id' est optionnelle et sera générée automatiquement si absente.\n# Séparez les services par un point-virgule (;) et l'année par un deux-points (:).\n# Exemple pour la colonne services : \"GEOTER:2024;SPANC:2025\"";
    const csvString = `${headers}\n${example}`;
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "trame_import_entites.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
            try {
                const newData = parseCsv(text);
                setData(newData);
                alert(`${newData.length} entités importées avec succès !`);
            } catch (error) {
                console.error("Erreur lors du parsage du CSV:", error);
                alert("Le fichier CSV ne semble pas être au bon format.");
            }
        }
    };
    reader.readAsText(file, 'UTF-8');
    if (event.target) {
        event.target.value = '';
    }
  };

  const columns: ColumnDef<Entity>[] = React.useMemo(() => [
    {
      accessorKey: 'nom',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Collectivité
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: EditableCell,
    },
    {
      accessorKey: 'population',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Population
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: EditableCell,
    },
    {
        accessorKey: 'type',
        header: 'Type',
        cell: EditableCell,
    },
    {
      accessorKey: 'statut',
      header: 'Statut',
      cell: EditableCell,
    },
    {
      accessorKey: 'services',
      header: 'Services Actifs',
      cell: EditableCell,
      enableSorting: false,
    },
    {
      id: 'actions',
      cell: ({ row, table }) => {
        const isEditing = (table.options.meta as any)?.editingRowId === row.id;

        return isEditing ? (
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => (table.options.meta as any)?.setEditingRowId(null)}
            >
              Sauvegarder
            </Button>
          </div>
        ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Ouvrir le menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => (table.options.meta as any)?.setEditingRowId(row.id)}
                >
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => (table.options.meta as any)?.deleteRow(row.index)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    meta: {
      editingRowId,
      setEditingRowId,
      openSelectId,
      setOpenSelectId,
      updateData: (rowIndex: number, columnId: string, value: any) => {
        setData((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex]!,
                [columnId]: value,
              };
            }
            return row;
          })
        );
      },
      deleteRow: (rowIndex: number) => {
        setData((old) => old.filter((_, index) => index !== rowIndex));
      },
      addRow: () => {
        const newId = `ENT-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
        const newRow: Entity = {
            id: newId,
            nom: "Nouvelle collectivité",
            population: 0,
            type: "Utilisatrice",
            statut: "Inactif",
            services: [],
        };
        setData((old) => [...old, newRow]);
        setEditingRowId(newId);
      },
    },
  });

  return (
    <div className="flex flex-col h-full">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".csv"
            style={{ display: 'none' }}
        />
      <Header
        title="Gestion des Entités"
        actions={
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportTemplate}>
              <FileText className="mr-2 h-4 w-4" />
              Exporter Trame
            </Button>
            <Button variant="outline" size="sm" onClick={handleImportClick}>
              <Upload className="mr-2 h-4 w-4" />
              Importer
            </Button>
            <Button size="sm" onClick={() => table.options.meta?.addRow()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter une Entité
            </Button>
          </div>
        }
      />
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Entités</CardTitle>
            <CardDescription>
              Une liste de toutes les entités du système.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Filtrer par nom de collectivité..."
                value={(table.getColumn('nom')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                  table.getColumn('nom')?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id} className="p-0">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        Aucun résultat.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredRowModel().rows.length} ligne(s) trouvée(s).
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Lignes par page</p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value))
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 40, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                        Page {table.getState().pagination.pageIndex + 1} sur{' '}
                        {table.getPageCount()}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Première page</span>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Page précédente</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Page suivante</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Dernière page</span>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
