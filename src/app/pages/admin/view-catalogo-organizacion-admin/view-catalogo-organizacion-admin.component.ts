import { AfterViewInit, Component, ViewChild,Inject,EventEmitter } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { ViewCatalogoOrganizacionAdminDataSource, ViewCatalogoOrganizacionAdminItem } from './view-catalogo-organizacion-admin-datasource';
import { CatalogoOrganizacionService } from 'src/app/services/catalogo-organizacion.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { VariableService } from 'src/app/services/variable.service';

@Component({
  selector: 'app-view-catalogo-organizacion-admin',
  templateUrl: './view-catalogo-organizacion-admin.component.html',
  styleUrls: ['./view-catalogo-organizacion-admin.component.css']
})
export class ViewCatalogoOrganizacionAdminComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<ViewCatalogoOrganizacionAdminItem>;
  dataSource: ViewCatalogoOrganizacionAdminDataSource;


  constructor(private catalogoOrganizacionService:CatalogoOrganizacionService, 
    public dialog: MatDialog,
    private route:ActivatedRoute,) {
    this.dataSource = new ViewCatalogoOrganizacionAdminDataSource();
  }

  displayedColumns = ['dato1', 'dato2', 'dato3', 'opciones'];
  
  ngAfterViewInit(): void {
  }
  
  idOrganizacion=0;
  siglasOrganizacion='';

  ngOnInit(): void {
    this.idOrganizacion = this.route.snapshot.params['idOrganizacion'];
    this.siglasOrganizacion = this.route.snapshot.params['siglas'];
    this.listar();
  }

    listaDatos : any = []

    listar()
    {
      this.catalogoOrganizacionService.obtenerCatalogoPorOrganizacion(this.idOrganizacion).subscribe(
          res=>{
            this.listaDatos=res;
          },
          err=>console.log(err)
        )
    }
  

    eliminar(id:any){
      Swal.fire({
        title:'Eliminar variable',
        text:'¿Estás seguro de eliminar la variable?',
        icon:'warning',
        showCancelButton:true,
        confirmButtonColor:'#3085d6',
        cancelButtonColor:'#d33',
        confirmButtonText:'Eliminar',
        cancelButtonText:'Cancelar'
      }).then((result) => {
        if(result.isConfirmed){
          this.catalogoOrganizacionService.eliminar(id).subscribe(
            (data) => {
              this.listaDatos = this.listaDatos.filter((lista:any) => lista.idVariableOrganizacion != id);
              Swal.fire('Variable eliminada','La variable ha sido eliminada','success');
              this.listar();
            },
            (error) => {
              Swal.fire('Error','Error al eliminar la variable','error');
            }
          )
        }
      })
    }

    //paginacion y busqueda
    page_size:number=5
    page_number:number=1
    page_size_options=[5,10,20,50,100]
  
    handlePage(e: PageEvent){
      this.page_size=e.pageSize
      this.page_number=e.pageIndex + 1
    }
    
    public search: string = '';
  
    onSearch( search: string ) {
      this.search = search;
    }

    openImportar(): void {
      const dialogRef = this.dialog.open(DialogImportarCatalogoOrganizacion, {
      });
      dialogRef.afterClosed().subscribe(() => {
        this.listar();
      });
    }
  
    agregar(): void {
      const dialogRef = this.dialog.open(DialogAgregarVariableOrganizacion, {
        data: { idOrganizacion: this.idOrganizacion},
      });
      dialogRef.afterClosed().subscribe(() => {
        this.listar();
        
      });
    }

    editar(id:any, dato1:any, dato2:any, dato3:any, dato4:any): void {
      const dialogRef = this.dialog.open(DialogEditarVariableOrganizacion, {
        data: { idVariableOrganizacion:id,codigoVariableOrganizacion:dato1,nombreVariableOrganizacion:dato2, descripcion:dato3,idVariable:dato4, idOrganizacion: this.idOrganizacion},
      });
      dialogRef.afterClosed().subscribe(() => {
        this.listar();
        
      });
    }
    
  }
  
  
  
  
  
  interface DatosActualizar {
    idVariableOrganizacion:0,
    codigoVariableOrganizacion:'',
    descripcion:'',
    nombreVariableOrganizacion:'',
    vigencia:1,
    idOrganizacion: 0,
    idVariable:0,
  }
 
    
  @Component({
    selector: 'agregar-variable-catalogo',
    templateUrl: 'agregar-variable-catalogo.html',
    styleUrls: ['./view-catalogo-organizacion-admin.component.css']
  })
  export class DialogAgregarVariableOrganizacion {
    constructor(
      
      public dialogRef: MatDialogRef<DialogAgregarVariableOrganizacion>,
      private snack: MatSnackBar,
      @Inject(MAT_DIALOG_DATA) public data1: DatosActualizar,
      private catalogoOrganizacionService:CatalogoOrganizacionService,
      private variableService:VariableService,
    ) { }
  
  
  
    public data={
      codigoVariableOrganizacion:'',
      descripcion:'',
      nombreVariableOrganizacion:'',
      vigencia:1,
      organizacion:{
        idOrganizacion:0,
      },
      variable:{
        idVariable:0
      }
    }
  
    public afterClosed: EventEmitter<void> = new EventEmitter<void>();
  
    onNoClick(): void {
      this.dialogRef.close();
    }
  
  
    idTipoVariableAux=0;
    ngOnInit(): void {
      this.data.organizacion.idOrganizacion=this.data1.idOrganizacion;
      this.listarVariables();
    }
  
    
  
    varible : any = []
  
    listarVariables()
      {
        this.variableService.listar().subscribe(
            res=>{
              this.varible=res;
            },
            err=>console.log(err)
          )
      }
  
      
      public agregar() {
  
        if (this.data.codigoVariableOrganizacion == '') {
          this.snack.open('El código de la variable es requerido !!', 'Aceptar', {
            duration: 3000
          })
          return;
        }
  
        if (this.data.nombreVariableOrganizacion == '') {
          this.snack.open('El nombre de la variable es requerido !!', 'Aceptar', {
            duration: 3000
          })
          return;
        }
  
        if (this.data.descripcion == '') {
          this.snack.open('La descripción de variable es requerido !!', 'Aceptar', {
            duration: 3000
          })
          return;
        }
  
        if (this.data.variable.idVariable == 0) {
          this.snack.open('La variable a la que referencia es requerido !!', 'Aceptar', {
            duration: 3000
          })
          return;
        }
  
        this.catalogoOrganizacionService.guardar(this.data).subscribe(
          (data) => {
            Swal.fire('Variable añadida', 'La variable se añadio con éxito', 'success').then(
              (e) => {
                this.afterClosed.emit();
                this.dialogRef.close();
              })
          }, (error) => {
            Swal.fire('Error al anadir la variable', 'No se registro la nueva variable', 'error');
            console.log(error);
          }
        );
      }
    
    
    }

    @Component({
      selector: 'editar-variable-catalogo',
      templateUrl: 'editar-variable-catalogo.html',
      styleUrls: ['./view-catalogo-organizacion-admin.component.css']
    })
    export class DialogEditarVariableOrganizacion {
      constructor(
        
        public dialogRef: MatDialogRef<DialogEditarVariableOrganizacion>,
        private snack: MatSnackBar,
        @Inject(MAT_DIALOG_DATA) public data1: DatosActualizar,
        private catalogoOrganizacionService:CatalogoOrganizacionService,
        private variableService:VariableService,
      ) { }
    
    
    
      
    
      public afterClosed: EventEmitter<void> = new EventEmitter<void>();
    
      onNoClick(): void {
        this.dialogRef.close();
      }
    
    
      idTipoVariableAux=0;
      ngOnInit(): void {
        this.data.idVariableOrganizacion=this.data1.idVariableOrganizacion;
        this.data.codigoVariableOrganizacion=this.data1.codigoVariableOrganizacion;
        this.data.descripcion=this.data1.descripcion;
        this.data.nombreVariableOrganizacion=this.data1.nombreVariableOrganizacion;
        this.data.variable.idVariable=this.data1.idVariable;
        this.data.organizacion.idOrganizacion=this.data1.idOrganizacion;
        this.listarVariables();
      }

      public data={
        idVariableOrganizacion:0,
        codigoVariableOrganizacion:'',
        descripcion:'',
        nombreVariableOrganizacion:'',
        vigencia:1,
        organizacion:{
          idOrganizacion:0,
        },
        variable:{
          idVariable:0
        }
      }
    
      
    
      varible : any = []
    
      listarVariables()
        {
          this.variableService.listar().subscribe(
              res=>{
                this.varible=res;
              },
              err=>console.log(err)
            )
        }
    
        
        public agregar() {
    
          if (this.data.codigoVariableOrganizacion == '') {
            this.snack.open('El código de la variable es requerido !!', 'Aceptar', {
              duration: 3000
            })
            return;
          }
    
          if (this.data.nombreVariableOrganizacion == '') {
            this.snack.open('El nombre de la variable es requerido !!', 'Aceptar', {
              duration: 3000
            })
            return;
          }
    
          if (this.data.descripcion == '') {
            this.snack.open('La descripción de variable es requerido !!', 'Aceptar', {
              duration: 3000
            })
            return;
          }
    
          if (this.data.variable.idVariable == 0) {
            this.snack.open('La variable a la que referencia es requerido !!', 'Aceptar', {
              duration: 3000
            })
            return;
          }
    
          this.catalogoOrganizacionService.guardar(this.data).subscribe(
            (data) => {
              Swal.fire('Variable actualizada', 'La variable se actualizo con éxito', 'success').then(
                (e) => {
                  this.afterClosed.emit();
                  this.dialogRef.close();
                })
            }, (error) => {
              Swal.fire('Error al actualizadar la variable', 'No se actualizado variable', 'error');
              console.log(error);
            }
          );
        }
      }
    
    export interface FamiliaDTO {
      idFamilia: number;
      descripcion: string;
      descripcionCompleta: string;
      checked: boolean;
    }
  
  

  
@Component({
  selector: 'importar-variables-catalogo-organizacion',
  templateUrl: 'importar-variables-catalogo-organizacion.html',
  styleUrls: ['./view-catalogo-organizacion-admin.component.css']
})
export class DialogImportarCatalogoOrganizacion {
  constructor(
    public dialogRef: MatDialogRef<DialogImportarCatalogoOrganizacion>,
    private snack: MatSnackBar,
    private catalogoOrganizacionService: CatalogoOrganizacionService,

  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  validarXLS=false;
  validarVariables=false;
  validarPerfilado=false;

  ngOnInit(): void {
    
  }

  verBoton=false;
  verBotonImput=true;
  verBotonSiguintePaso=false;

  file: File = new File([], "");
  fileAux: File = new File([], "");

  onFileChanged(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.file = event.target.files[0];
      this.fileAux = event.target.files[0];
      this.verBoton = true;
      this.verBotonImput = false;
      this.convertToXLS2(this.file).then((transformedFile: File) => {
        this.file = transformedFile;
        this.snack.open('Archivo seleccionado correctamente', 'Aceptar', {
          duration: 3000,
        });
      });
    } else {
      this.verBoton = false;
      this.verBotonImput = true;
    }
  }
  
  // transformar archivo
  
  convertToXLS2(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
  
      fileReader.onload = (event: any) => {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const excelBuffer: any[] = [];
  
        workbook.SheetNames.forEach((sheetName: string) => {
          const worksheet = workbook.Sheets[sheetName];
          const sheetJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          excelBuffer.push(sheetJson);
        });
  
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(excelBuffer[0]);
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  
        const wbout = XLSX.write(wb, { bookType: 'xls', type: 'array' });
  
        // Create a new Blob object with the transformed data
        const transformedBlob = new Blob([wbout], { type: 'application/vnd.ms-excel' });
  
        // Create a new File object from the Blob
        const transformedFile = new File([transformedBlob], 'archivo_transformado.xls', {
          type: 'application/vnd.ms-excel',
        });
  
        resolve(transformedFile);
      };
  
      fileReader.onerror = (error: any) => {
        reject(error);
      };
  
      fileReader.readAsBinaryString(file);
    });
  }

  listaDatos:any=[];
  comprobarEstado(){
    const formData = new FormData();
    formData.append('file', this.file);
    this.catalogoOrganizacionService.comprobarArchivo(formData).subscribe(
      (dato:any) => {
        if(dato==true){
          Swal.fire('Archivo correcto','El archivo tiene la estructura correcta','success');
          this.verBoton=false;
          this.verBotonImput=false;
          this.verBotonSiguintePaso=true;
        }else{
          Swal.fire('Error !!','El archivo cargado no tiene el formato adecuado','error')
          this.verBoton=false;
          this.verBotonImput=true;
        }
      },
      (error) => {
        console.log(error);
        Swal.fire('Error !!','El archivo cargado no tiene el formato adecuado','error')
      }
    )
  }

  guardarDatos(){
    const formData = new FormData();
    formData.append('file', this.file);
    this.catalogoOrganizacionService.importarArchivo(formData).subscribe(
      (dato:any) => {
        Swal.fire('Registro exitoso','Las variables de las organizaciones han sigo guardadas de forma correcta','success');
      },
      (error) => {
        console.log(error);
        Swal.fire('Error !!','Error al registrar las variables','error')
      }
    )
  }
}