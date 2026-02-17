import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as Papa from 'papaparse';

// Definición basada en tu nuevo archivo
export interface DivipolaEntry {
  "Código Departamento": string;
  "Nombre Departamento": string;
  "Código Municipio": string;
  "Nombre Municipio": string;
  "Tipo": string; // Updated column name
}

@Injectable({ providedIn: 'root' })
export class DivipolaService {
  private http = inject(HttpClient);
  
  // Signal privada con la fuente de datos
  private _rawData = signal<DivipolaEntry[]>([]);

  // Signal computada: Lista de departamentos (únicos y ordenados)
  public departamentos = computed(() => {
    const map = new Map<string, string>();
    this._rawData().forEach(item => {
      const code = item["Código Departamento"];
      if (code && !map.has(code)) {
        map.set(code, item["Nombre Departamento"]);
      }
    });
    
    return Array.from(map.entries())
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  });

  constructor() {
    this.initData();
  }

  private initData() {
    // Cargamos el CSV desde la carpeta assets
    this.http.get('assets/Divipola.csv', { responseType: 'text' })
      .subscribe({
        next: (csv) => {
          Papa.parse(csv, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
              this._rawData.set(result.data as DivipolaEntry[]);
            }
          });
        },
        error: (err) => console.error('Error cargando DIVIPOLA:', err)
      });
  }

  // Método optimizado para filtrar municipios
  getMunicipiosPorDepto(deptoId: string) {
    return this._rawData()
      .filter(m => m["Código Departamento"] === deptoId)
      .map(m => ({
        id: m["Código Municipio"],
        nombre: m["Nombre Municipio"]
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }
}