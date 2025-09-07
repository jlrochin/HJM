"use client"

import { useState } from "react"
import { Download, FileSpreadsheet, FileText } from "lucide-react"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

interface ExportOptionsProps {
  data: any[]
  filename?: string
}

export function ExportOptions({ data, filename = "servicios" }: ExportOptionsProps) {
  const [exportLoading, setExportLoading] = useState<string | null>(null)

  // Simulate export functionality
  const handleExport = (format: string) => {
    setExportLoading(format)
    if (format === "excel") {
      // Exportar a Excel
      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Datos")
      XLSX.writeFile(workbook, `${filename}.xlsx`)
      setExportLoading(null)
      toast({
        title: "Exportación completada",
        description: `Los datos han sido exportados en formato EXCEL correctamente.`,
      })
    } else if (format === "pdf") {
      // Exportar a PDF
      const doc = new jsPDF()
      if (data.length > 0) {
        const columns = Object.keys(data[0])
        const rows = data.map((row) => columns.map((col) => row[col]))
        autoTable(doc, {
          head: [columns],
          body: rows,
          styles: {
            fontSize: 9,
            cellPadding: 2,
            overflow: 'linebreak',
          },
          headStyles: {
            fillColor: [41, 128, 185], // azul corporativo
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center',
          },
          columnStyles: {
            description: { cellWidth: 50 },
            name: { cellWidth: 30 },
            location: { cellWidth: 30 },
            responsiblePerson: { cellWidth: 35 },
          },
          tableWidth: 'auto',
        })
      } else {
        doc.text("No hay datos para exportar", 10, 10)
      }
      doc.save(`${filename}.pdf`)
      setExportLoading(null)
      toast({
        title: "Exportación completada",
        description: `Los datos han sido exportados en formato PDF correctamente.`,
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Exportar</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Exportar datos</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("pdf")} disabled={exportLoading === "pdf"}>
          <FileText className="mr-2 h-4 w-4 text-rose-500" />
          <span>Exportar como PDF</span>
          {exportLoading === "pdf" && (
            <Badge variant="outline" className="ml-2 animate-pulse">
              Exportando...
            </Badge>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("excel")} disabled={exportLoading === "excel"}>
          <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-500" />
          <span>Exportar como Excel</span>
          {exportLoading === "excel" && (
            <Badge variant="outline" className="ml-2 animate-pulse">
              Exportando...
            </Badge>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
