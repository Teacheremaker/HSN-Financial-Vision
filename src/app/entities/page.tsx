
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
import type { Entity, ServiceSubscription, EntityType, MultiSelectOption, ServiceDefinition } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { Label } from '@/components/ui/label';
import { useEntityStore } from '@/hooks/use-entity-store';
import { useServiceStore } from '@/hooks/use-service-store';
import { useTariffStore } from '@/hooks/use-tariff-store';
import { getTariffPriceForEntity } from '@/lib/projections';

const EditableCell = ({ getValue, row, column, table }) => {
  const initialValue = getValue();
  const tableMeta = table.options.meta as any;
  const isEditing = tableMeta?.editingRowId === row.id;

  if (!isEditing) {
    if (column.id === 'services') {
      const services = getValue<ServiceSubscription[]>();
      const { tariffs, serviceColorMap } = table.options.meta as any;
      if (!services || services.length === 0) {
        return <span className="text-muted-foreground">Aucun</span>;
      }
      return (
        <div className="flex flex-wrap gap-2 items-start">
          {services.map((service) => {
            const price = getTariffPriceForEntity(row.original as Entity, service.name, tariffs);
            return (
              <div key={service.name} className="flex flex-col items-center">
                <Badge
                  variant="default"
                  className="font-normal text-white"
                  style={{ backgroundColor: serviceColorMap[service.name] ?? 'hsl(var(--muted))' }}
                >
                  {service.name} ({service.year})
                </Badge>
                <span className="text-xs text-muted-foreground mt-1">
                  {price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                </span>
              </div>
            )
          })}
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
    case 'entityType':
        return (
            <Select value={initialValue ?? 'Commune'} onValueChange={onUpdate}>
                <SelectTrigger className="h-8">
                    <SelectValue placeholder="Type d'entité" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Commune">Commune</SelectItem>
                    <SelectItem value="Syndicat">Syndicat</SelectItem>
                    <SelectItem value="Communauté de communes">Communauté de communes</SelectItem>
                    <SelectItem value="Communauté d'agglo">Communauté d'agglo</SelectItem>
                    <SelectItem value="Département">Département</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
            </Select>
        );
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
                return existingService || { name: name, year: 2025 };
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
                    options={tableMeta?.serviceOptions || []}
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
    const headers = ['nom', 'population', 'type', 'entityType', 'statut', 'services'];
    const csvRows = [`\uFEFF${headers.join(',')}`]; // Add BOM for Excel
    const quote = (field: any) => {
        const stringField = String(field ?? '');
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
            return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
    };

    data.forEach(entity => {
        const servicesString = entity.services.map(s => `${s.name}:${s.year}`).join(',');
        const row = [
            quote(entity.nom),
            quote(entity.population),
            quote(entity.type),
            quote(entity.entityType || 'Commune'),
            quote(entity.statut),
            quote(servicesString)
        ].join(',');
        csvRows.push(row);
    });

    return csvRows.join('\n');
};

const validEntityTypes: EntityType[] = ['Commune', 'Syndicat', 'Communauté de communes', 'Communauté d\'agglo', 'Département', 'Autre'];

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
            .split(',')
            .filter(Boolean)
            .map((s: string) => {
                const [name, year] = s.split(':');
                return { name: name?.trim(), year: parseInt(year, 10) };
            })
            .filter((s: ServiceSubscription) => s.name && !isNaN(s.year));

        const statut: 'Actif' | 'Inactif' = services.length > 0 ? 'Actif' : (rowData.statut === 'Actif' ? 'Actif' : 'Inactif');

        const entityType = validEntityTypes.includes(rowData.entityType as any) ? rowData.entityType as EntityType : 'Commune';

        return {
            id: rowData.id || `ENT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            nom: rowData.nom || 'Sans Nom',
            population: parseInt(rowData.population as any, 10) || 0,
            type: rowData.type === 'Fondatrice' ? 'Fondatrice' : 'Utilisatrice',
            entityType,
            statut,
            services: services,
        };
    });
};


export default function EntitiesPage() {
  const { entities, setEntities, updateEntity, deleteEntity, addEntity } = useEntityStore();
  const { services: serviceDefinitions, getServiceNames } = useServiceStore();
  const { tariffs } = useTariffStore();
  
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [editingRowId, setEditingRowId] = React.useState<string | null>(null);
  const [openSelectId, setOpenSelectId] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [serviceFilter, setServiceFilter] = React.useState<string>('');
  const [yearFilter, setYearFilter] = React.useState<string>('');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const serviceOptions: MultiSelectOption[] = React.useMemo(() => {
    return getServiceNames().map(name => ({ value: name, label: name }));
  }, [getServiceNames]);
  
  const serviceColorMap = React.useMemo(() => 
    serviceDefinitions.reduce((acc, service) => {
      acc[service.name] = service.color;
      return acc;
    }, {} as Record<string, string>),
  [serviceDefinitions]);

  const yearsWithServices = React.useMemo(() => {
    const years = [];
    for (let year = 2025; year <= 2032; year++) {
      years.push(year);
    }
    return years;
  }, []);

  const handleExport = () => {
    const csvString = generateCsv(entities);
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
    const headers = "nom,population,type,entityType,statut,services";
    const comments = [
        "# La colonne 'id' est optionnelle et sera générée automatiquement si absente.",
        "# Séparez les services par une virgule (,) et l'année par un deux-points (:).",
        "# Exemple pour la colonne services : \"GEOTER:2024,SPANC:2025\"",
        "# Les valeurs possibles pour entityType sont : Commune, Syndicat, Communauté de communes, Communauté d'agglo, Département, Autre."
    ].join('\n');
    const csvString = `${headers}\n${comments}`;
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
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
                setEntities(newData);
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

  const handleAddRow = () => {
    const newId = `ENT-${Date.now()}`;
    addEntity({
      id: newId,
      nom: "Nouvelle collectivité",
      population: 0,
      type: "Utilisatrice",
      entityType: "Commune",
      statut: "Inactif",
      services: [],
    });
    setEditingRowId(newId);
  }

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
        id: 'totalPricePerInhabitant',
        header: ({ column }) => (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Prix total / hab.
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        accessorFn: (row) => {
            if (!row.population || row.population === 0) {
                return 0;
            }
            const totalAnnualCost = row.services.reduce((acc, service) => {
                const price = getTariffPriceForEntity(row, service.name, tariffs);
                return acc + price;
            }, 0);
            return totalAnnualCost / row.population;
        },
        cell: ({ row }) => {
            const pricePerInhabitant = row.getValue<number>('totalPricePerInhabitant');

            if (pricePerInhabitant === 0 && (!row.original.population || row.original.services.length === 0)) {
                return <div className="text-right text-muted-foreground">-</div>;
            }

            return (
                <div className="text-right font-medium">
                    {pricePerInhabitant.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </div>
            );
        },
    },
    {
        accessorKey: 'type',
        header: ({ column }) => (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Type
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: EditableCell,
    },
    {
        accessorKey: 'entityType',
        header: ({ column }) => (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Type d'entité
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: EditableCell,
    },
    {
      accessorKey: 'statut',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Statut
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: EditableCell,
    },
    {
      accessorKey: 'services',
      header: 'Services actifs',
      cell: EditableCell,
      enableSorting: false,
      filterFn: (row, columnId, filterValue: { services: string[]; year: number | null }) => {
        const rowServices = row.getValue<ServiceSubscription[]>(columnId) ?? [];
        if (!filterValue) return true;

        const { services: selectedServices, year: selectedYear } = filterValue;

        const servicesMatch =
          !selectedServices ||
          selectedServices.length === 0 ||
          rowServices.some((s) => selectedServices.includes(s.name));

        const yearMatch =
          !selectedYear || rowServices.some((s) => s.year === selectedYear);

        return servicesMatch && yearMatch;
      },
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
                <DropdownMenuItem className="text-destructive" onClick={() => (table.options.meta as any)?.deleteRow(row.original.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        );
      },
    },
  ], [tariffs]);

  const table = useReactTable({
    data: entities,
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
        const entityId = entities[rowIndex]?.id;
        if(entityId) {
          updateEntity(entityId, columnId, value);
        }
      },
      deleteRow: (entityId: string) => {
        deleteEntity(entityId);
      },
      serviceOptions,
      serviceColorMap,
      tariffs,
    },
  });

  React.useEffect(() => {
    const yearAsNumber = yearFilter ? parseInt(yearFilter, 10) : null;
    const servicesForFilter = serviceFilter ? [serviceFilter] : [];
    
    const filterValue = {
        services: servicesForFilter,
        year: (yearAsNumber && !isNaN(yearAsNumber)) ? yearAsNumber : null,
    };

    if (filterValue.services.length > 0 || filterValue.year !== null) {
        table.getColumn('services')?.setFilterValue(filterValue);
    } else {
        table.getColumn('services')?.setFilterValue(undefined); // Clear filter
    }
}, [serviceFilter, yearFilter, table]);

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
        title="Gestion des entités"
        actions={
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportTemplate}>
              <FileText className="mr-2 h-4 w-4" />
              Exporter trame
            </Button>
            <Button variant="outline" size="sm" onClick={handleImportClick}>
              <Upload className="mr-2 h-4 w-4" />
              Importer
            </Button>
            <Button size="sm" onClick={handleAddRow}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter une entité
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
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              <Input
                placeholder="Filtrer par collectivité..."
                value={(table.getColumn('nom')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                  table.getColumn('nom')?.setFilterValue(event.target.value)
                }
                className="w-full sm:w-auto sm:max-w-sm"
              />
               <Select
                value={serviceFilter}
                onValueChange={(value) => {
                  if (value === "all") {
                    setServiceFilter("");
                  } else {
                    setServiceFilter(value);
                  }
                }}
              >
                <SelectTrigger className="w-full sm:w-auto sm:max-w-xs">
                  <SelectValue placeholder="Filtrer par service..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les services</SelectItem>
                  {serviceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={yearFilter}
                onValueChange={(value) => {
                  if (value === "all") {
                    setYearFilter("");
                  } else {
                    setYearFilter(value);
                  }
                }}
              >
                <SelectTrigger className="w-full sm:w-auto sm:max-w-[180px]">
                  <SelectValue placeholder="Filtrer par année..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les années</SelectItem>
                  {yearsWithServices.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

    

    