
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GasStation } from "@/types/station";

interface StationsTableProps {
  stations: GasStation[];
  onEdit: (station: GasStation) => void;
  onDelete: (station: GasStation) => void;
}

const StationsTable = ({ stations, onEdit, onDelete }: StationsTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>الاسم</TableHead>
            <TableHead>المنطقة</TableHead>
            <TableHead>الموقع الفرعي</TableHead>
            <TableHead className="hidden md:table-cell">أنواع الوقود</TableHead>
            <TableHead className="text-center">الإحداثيات</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10">
                لا توجد محطات مضافة
              </TableCell>
            </TableRow>
          ) : (
            stations.map((station, index) => (
              <TableRow key={station.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{station.name}</TableCell>
                <TableCell>{station.region}</TableCell>
                <TableCell>{station.sub_region}</TableCell>
                <TableCell className="hidden md:table-cell">{station.fuel_types || "-"}</TableCell>
                <TableCell className="text-center text-xs">
                  <div>خط العرض: {station.latitude}</div>
                  <div>خط الطول: {station.longitude}</div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(station)}
                    >
                      <Edit size={16} className="text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(station)}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default StationsTable;
