
'use client';

import * as React from 'react';
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  Row,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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
import type { Entity } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const initialData: Entity[] = [
  { id: 'ENT-001', nom: 'Ville de Metropolia', population: 50000, type: 'Fondatrice', statut: 'Actif', services: ['Eau', 'Déchets'], anneeAdhesion: 2022 },
  { id: 'ENT-002', nom: 'Ville de Silverlake', population: 25000, type: 'Utilisatrice', statut: 'Actif', services: ['Eau'], anneeAdhesion: 2023 },
  { id: 'ENT-003', nom: 'Village d\'Oakhaven', population: 5000, type: 'Utilisatrice', statut: 'Inactif', services: [], anneeAdhesion: 2024 },
  { id: 'ENT-004', nom: 'Arrondissement d\'Ironwood', population: 120000, type: 'Fondatrice', statut: 'Actif', services: ['Eau', 'Déchets', 'Transport'], anneeAdhesion: 2022 },
  { id: 'ENT-005', nom: 'Municipalité de Sunfield', population: 12000, type: 'Utilisatrice', statut: 'Actif', services: ['Déchets'], anneeAdhesion: 2024 },
];

const EditableCell = ({ getValue, row, column, table }) => {
  const initialValue = getValue();
  const tableMeta = table.options.meta;
  const isEditing = tableMeta?.editingRowId === row.id;

  if (!isEditing) {
    if (column.id === 'services') {
      const services = getValue<string[]>();
      return (
        <div className="flex flex-wrap gap-1">
          {services.map((service) => (
            <Badge key={service} variant="secondary">
              {service}
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
    case 'services':
        return (
            <Input
                className="h-8"
                value={(initialValue as string[]).join(', ')}
                onChange={(e) => onUpdate(e.target.value.split(',').map(s => s.trim()))}
                />
        )
    default:
        return <Input className="h-8" value={initialValue} onChange={(e) => onUpdate(e.target.value)} type={typeof initialValue === 'number' ? 'number' : 'text'} />;

  }
};


export default function EntitiesPage() {
  const [data, setData] = React.useState(initialData);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [editingRowId, setEditingRowId] = React.useState<string | null>(null);

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
    },
    {
        accessorKey: 'anneeAdhesion',
        header: 'Année Adhésion',
        cell: EditableCell,
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
    state: {
      sorting,
      columnFilters,
    },
    meta: {
      editingRowId,
      setEditingRowId,
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
            anneeAdhesion: new Date().getFullYear(),
        };
        setData((old) => [...old, newRow]);
        setEditingRowId(newId);
      },
    },
  });

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Gestion des Entités"
        actions={
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => alert('Fonctionnalité à implémenter')}>
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button variant="outline" size="sm" onClick={() => alert('Fonctionnalité à implémenter')}>
              <FileText className="mr-2 h-4 w-4" />
              Exporter Trame
            </Button>
            <Button variant="outline" size="sm" onClick={() => alert('Fonctionnalité à implémenter')}>
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
