import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import {
  ParametroBase,
  TipoDocumento,
  EstadoCivil,
  Sexo,
  NivelEscolaridad,
  TipoPersona,
  TipoOrganizacion,
  TipoVivienda,
  TenenciaVivienda,
  TipoSaneamiento,
  TipoServicio,
  FuenteAgua,
  MaterialParedes,
  MaterialPisos,
  TipoTejado,
  TipoCocina,
  CombustibleCocina,
  DisposicionBasuras,
  TipoActividadEconomica,
  SituacionLaboral,
  RegimenSalud,
  TipoTransporte,
  TipoRiesgo,
  NivelRiesgo,
  TipoProblema,
  TipoAyuda,
  FuenteRecurso,
  TipoIngreso,
  TipoGasto,
  TipoBien,
  EstadoBien,
  TipoServicioPublico,
  EstadoServicioPublico,
  TipoVial,
  EstadoVial,
  TipoTransportePublico,
  EstadoTransportePublico,
  TipoComunicacion,
  EstadoComunicacion,
  TipoEducacion,
  NivelEducativo,
  TipoEstablecimiento,
  EstadoEstablecimiento,
  TipoSalud,
  NivelAtencion,
  TipoEstablecimientoSalud,
  EstadoEstablecimientoSalud,
  TipoRecreacion,
  NivelRecreacion,
  TipoEstablecimientoRecreacion,
  EstadoEstablecimientoRecreacion,
  TipoSeguridad,
  NivelSeguridad,
  TipoEstablecimientoSeguridad,
  EstadoEstablecimientoSeguridad,
  TipoAdministracionPublica,
  NivelAdministracionPublica,
  TipoEstablecimientoAdministracionPublica,
  EstadoEstablecimientoAdministracionPublica,
  TipoMercado,
  NivelMercado,
  TipoEstablecimientoMercado,
  EstadoEstablecimientoMercado,
  TipoFinanciero,
  NivelFinanciero,
  TipoEstablecimientoFinanciero,
  EstadoEstablecimientoFinanciero,
  TipoReligion,
  NivelReligion,
  TipoEstablecimientoReligion,
  EstadoEstablecimientoReligion,
  TipoCultura,
  NivelCultura,
  TipoEstablecimientoCultura,
  EstadoEstablecimientoCultura,
  TipoDeporte,
  NivelDeporte,
  TipoEstablecimientoDeporte,
  EstadoEstablecimientoDeporte,
  TipoTurismo,
  NivelTurismo,
  TipoEstablecimientoTurismo,
  EstadoEstablecimientoTurismo,
  TipoAmbiente,
  NivelAmbiente,
  TipoEstablecimientoAmbiente,
  EstadoEstablecimientoAmbiente
} from '../models/domain.models';
import { ParametroTipo } from '../models/parametro-base.types';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ParametroBaseService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private _departamentos = signal<ParametroBase[]>([]);
  private _municipios = signal<Map<string, ParametroBase[]>>(new Map());
  private _tiposDocumento = signal<ParametroBase[]>([]);

  public departamentos = computed(() => 
    this._departamentos()
      .filter(p => p.deletedAt === null)
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  );
  private _estadosCivil = signal<ParametroBase[]>([]);
  private _sexos = signal<ParametroBase[]>([]);
  private _nivelesEscolaridad = signal<ParametroBase[]>([]);
  private _tiposPersona = signal<ParametroBase[]>([]);
  private _tiposOrganizacion = signal<ParametroBase[]>([]);
  private _tiposEncargado = signal<ParametroBase[]>([]);
  private _tiposVivienda = signal<ParametroBase[]>([]);
  private _tenenciasVivienda = signal<ParametroBase[]>([]);
  private _tiposSaneamiento = signal<ParametroBase[]>([]);
  private _tiposServicio = signal<ParametroBase[]>([]);
  private _fuentesAgua = signal<ParametroBase[]>([]);
  private _materialesParedes = signal<ParametroBase[]>([]);
  private _materialesPisos = signal<ParametroBase[]>([]);
  private _tiposTejado = signal<ParametroBase[]>([]);
  private _tiposCocina = signal<ParametroBase[]>([]);
  private _combustiblesCocina = signal<ParametroBase[]>([]);
  private _disposicionesBasuras = signal<ParametroBase[]>([]);
  private _tiposActividadEconomica = signal<ParametroBase[]>([]);
  private _situacionesLaborales = signal<ParametroBase[]>([]);
  private _regimenesSalud = signal<ParametroBase[]>([]);
  private _tiposTransporte = signal<ParametroBase[]>([]);
  private _tiposRiesgo = signal<ParametroBase[]>([]);
  private _nivelesRiesgo = signal<ParametroBase[]>([]);
  private _tiposProblema = signal<ParametroBase[]>([]);
  private _tiposAyuda = signal<ParametroBase[]>([]);
  private _fuentesRecurso = signal<ParametroBase[]>([]);
  private _tiposIngreso = signal<ParametroBase[]>([]);
  private _tiposGasto = signal<ParametroBase[]>([]);
  private _tiposBien = signal<ParametroBase[]>([]);
  private _estadosBien = signal<ParametroBase[]>([]);
  private _tiposServicioPublico = signal<ParametroBase[]>([]);
  private _estadosServicioPublico = signal<ParametroBase[]>([]);
  private _tiposVial = signal<ParametroBase[]>([]);
  private _estadosVial = signal<ParametroBase[]>([]);
  private _tiposTransportePublico = signal<ParametroBase[]>([]);
  private _estadosTransportePublico = signal<ParametroBase[]>([]);
  private _tiposComunicacion = signal<ParametroBase[]>([]);
  private _estadosComunicacion = signal<ParametroBase[]>([]);
  private _tiposEducacion = signal<ParametroBase[]>([]);
  private _nivelesEducativos = signal<ParametroBase[]>([]);
  private _tiposEstablecimiento = signal<ParametroBase[]>([]);
  private _estadosEstablecimiento = signal<ParametroBase[]>([]);
  private _tiposSalud = signal<ParametroBase[]>([]);
  private _nivelesAtencion = signal<ParametroBase[]>([]);
  private _tiposEstablecimientoSalud = signal<ParametroBase[]>([]);
  private _estadosEstablecimientoSalud = signal<ParametroBase[]>([]);
  private _tiposRecreacion = signal<ParametroBase[]>([]);
  private _nivelesRecreacion = signal<ParametroBase[]>([]);
  private _tiposEstablecimientoRecreacion = signal<ParametroBase[]>([]);
  private _estadosEstablecimientoRecreacion = signal<ParametroBase[]>([]);
  private _tiposSeguridad = signal<ParametroBase[]>([]);
  private _nivelesSeguridad = signal<ParametroBase[]>([]);
  private _tiposEstablecimientoSeguridad = signal<ParametroBase[]>([]);
  private _estadosEstablecimientoSeguridad = signal<ParametroBase[]>([]);
  private _tiposAdministracionPublica = signal<ParametroBase[]>([]);
  private _nivelesAdministracionPublica = signal<ParametroBase[]>([]);
  private _tiposEstablecimientoAdministracionPublica = signal<ParametroBase[]>([]);
  private _estadosEstablecimientoAdministracionPublica = signal<ParametroBase[]>([]);
  private _tiposMercado = signal<ParametroBase[]>([]);
  private _nivelesMercado = signal<ParametroBase[]>([]);
  private _tiposEstablecimientoMercado = signal<ParametroBase[]>([]);
  private _estadosEstablecimientoMercado = signal<ParametroBase[]>([]);
  private _tiposFinanciero = signal<ParametroBase[]>([]);
  private _nivelesFinanciero = signal<ParametroBase[]>([]);
  private _tiposEstablecimientoFinanciero = signal<ParametroBase[]>([]);
  private _estadosEstablecimientoFinanciero = signal<ParametroBase[]>([]);
  private _tiposReligion = signal<ParametroBase[]>([]);
  private _nivelesReligion = signal<ParametroBase[]>([]);
  private _tiposEstablecimientoReligion = signal<ParametroBase[]>([]);
  private _estadosEstablecimientoReligion = signal<ParametroBase[]>([]);
  private _tiposCultura = signal<ParametroBase[]>([]);
  private _nivelesCultura = signal<ParametroBase[]>([]);
  private _tiposEstablecimientoCultura = signal<ParametroBase[]>([]);
  private _estadosEstablecimientoCultura = signal<ParametroBase[]>([]);
  private _tiposDeporte = signal<ParametroBase[]>([]);
  private _nivelesDeporte = signal<ParametroBase[]>([]);
  private _tiposEstablecimientoDeporte = signal<ParametroBase[]>([]);
  private _estadosEstablecimientoDeporte = signal<ParametroBase[]>([]);
  private _tiposTurismo = signal<ParametroBase[]>([]);
  private _nivelesTurismo = signal<ParametroBase[]>([]);
  private _tiposEstablecimientoTurismo = signal<ParametroBase[]>([]);
  private _estadosEstablecimientoTurismo = signal<ParametroBase[]>([]);
  private _tiposAmbiente = signal<ParametroBase[]>([]);
  private _nivelesAmbiente = signal<ParametroBase[]>([]);
  private _tiposEstablecimientoAmbiente = signal<ParametroBase[]>([]);
  private _estadosEstablecimientoAmbiente = signal<ParametroBase[]>([]);

  public tiposDocumento = computed(() => 
    this._tiposDocumento()
      .filter(p => p.deletedAt === null)
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  );

  public estadosCivil = computed(() => 
    this._estadosCivil()
      .filter(p => p.deletedAt === null)
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  );

  public sexos = computed(() => 
    this._sexos()
      .filter(p => p.deletedAt === null)
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  );

  public nivelesEscolaridad = computed(() => 
    this._nivelesEscolaridad()
      .filter(p => p.deletedAt === null)
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  );

  public tiposPersona = computed(() => 
    this._tiposPersona()
      .filter(p => p.deletedAt === null)
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  );

  public tiposOrganizacion = computed(() => 
    this._tiposOrganizacion()
      .filter(p => p.deletedAt === null)
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  );

  public tiposEncargado = computed(() => 
    this._tiposEncargado()
      .filter(p => p.deletedAt === null)
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  );

  constructor() {
    this.loadBasicParameters();
  }

  private loadBasicParameters() {
    this.getByTipo('DEPARTAMENTO').subscribe(data => {
      this._departamentos.set(data);
    });

    this.getByTipo('TIPO DOCUMENTO REPRESENTANTE').subscribe(data => {
      this._tiposDocumento.set(data);
    });

    this.getByTipo('ESTADO_CIVIL').subscribe(data => {
      this._estadosCivil.set(data);
    });

    this.getByTipo('SEXO').subscribe(data => {
      this._sexos.set(data);
    });

    this.getByTipo('NIVEL_ESCOLARIDAD').subscribe(data => {
      this._nivelesEscolaridad.set(data);
    });

    this.getByTipo('TIPO_PERSONA').subscribe(data => {
      this._tiposPersona.set(data);
    });

    this.getByTipo('TIPO ORGANIZACION').subscribe(data => {
      this._tiposOrganizacion.set(data);
    });

    this.getByTipo('TIPO ENCARGADO').subscribe(data => {
      this._tiposEncargado.set(data);
    });
  }

  getByTipo(tipo: ParametroTipo): Observable<ParametroBase[]> {
    return this.http.get<ParametroBase[]>(`${this.apiUrl}/parametrobase`, {
      params: { tipo }
    }).pipe(
      catchError(error => {
        console.error(`Error loading parametros for tipo=${tipo}:`, error);
        return of([]);
      })
    );
  }

  getByTipoAndPadreId(tipo: ParametroTipo, padreId: string): Observable<ParametroBase[]> {
    const cacheKey = `${tipo}_${padreId}`;
    const cached = this._municipios().get(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http.get<ParametroBase[]>(`${this.apiUrl}/parametrobase`, {
      params: { tipo, padreId }
    }).pipe(
      tap(data => {
        this._municipios.update(map => new Map(map).set(cacheKey, data));
      }),
      catchError(error => {
        console.error(`Error loading parametros for tipo=${tipo}, padreId=${padreId}:`, error);
        return of([]);
      })
    );
  }

  getById(id: string): Observable<ParametroBase | null> {
    return this.http.get<ParametroBase>(`${this.apiUrl}/parametrobase/${id}`).pipe(
      catchError(error => {
        console.error(`Error loading parametro with id=${id}:`, error);
        return of(null);
      })
    );
  }

  getMunicipiosPorDepartamento(departamentoId: string): Observable<ParametroBase[]> {
    return this.getByTipoAndPadreId('MUNICIPIO', departamentoId).pipe(
      map(municipios => 
        municipios
          .filter(m => m.deletedAt === null)
          .sort((a, b) => a.nombre.localeCompare(b.nombre))
      )
    );
  }

  getMunicipiosPorDepto(deptoId: string): Observable<ParametroBase[]> {
    return this.getMunicipiosPorDepartamento(deptoId);
  }

  getParametros<T extends ParametroBase>(tipo: ParametroTipo): Observable<T[]> {
    return this.getByTipo(tipo) as Observable<T[]>;
  }

  refreshParametros(tipo: ParametroTipo): void {
    this.getByTipo(tipo).subscribe(data => {
      switch (tipo) {
        case 'DEPARTAMENTO':
          this._departamentos.set(data);
          break;
        case 'TIPO DOCUMENTO REPRESENTANTE':
          this._tiposDocumento.set(data);
          break;
        case 'ESTADO_CIVIL':
          this._estadosCivil.set(data);
          break;
        case 'SEXO':
          this._sexos.set(data);
          break;
        case 'NIVEL_ESCOLARIDAD':
          this._nivelesEscolaridad.set(data);
          break;
        case 'TIPO_PERSONA':
          this._tiposPersona.set(data);
          break;
        case 'TIPO ORGANIZACION':
          this._tiposOrganizacion.set(data);
          break;
        case 'TIPO ENCARGADO':
          this._tiposEncargado.set(data);
          break;
      }
    });
  }
}
