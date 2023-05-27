import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Trabajo } from 'src/app/models/models';
import { Publicacion } from 'src/app/models/publicacion';
import { User } from 'src/app/models/models';
import { PublicacionesService } from 'src/app/services/publicaciones.service';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-resp-trabajo',
  templateUrl: './resp-trabajo.component.html',
  styleUrls: ['./resp-trabajo.component.css']
})
export class RespTrabajoComponent {
  public trabajo: Trabajo | undefined;
  public publicacion: Publicacion | undefined;
  public nombreTrabajador = '';
  public mensajeTrabajador = '';
  public uidTrabajador = '';
  public isLoading: boolean= false;

  constructor(private route: ActivatedRoute, private firestore: AngularFirestore, private toast: HotToastService, private router: Router, private publicaciones: PublicacionesService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.route.queryParams.subscribe(params => {
      const trabajoId = params['trabajoId'];
      const publicacionId = params['publicacionId'];
  
      console.log('trabajoId:', trabajoId);
      console.log('publicacionId:', publicacionId);
  
      this.firestore.collection<Trabajo>('Trabajos').doc(trabajoId).get().toPromise().then((trabajoDoc) => {
        if (trabajoDoc && trabajoDoc.exists) {
          this.trabajo = trabajoDoc.data() as Trabajo;
          this.firestore.collection<User>('Usuarios').doc(this.trabajo.idUsuarioPublicacion).get().toPromise().then((usuarioDoc) => {
            if (usuarioDoc && usuarioDoc.exists) {
              const usuario = usuarioDoc.data() as User;
              this.nombreTrabajador = usuario.nombre + ' ' + usuario.apellido;
              this.publicaciones.uidUsuario = usuario.uid;
            }
          });
        }
      });
  
      this.firestore.collection<Publicacion>('Publicaciones').doc(publicacionId).get().toPromise().then((publicacionDoc) => {
        if (publicacionDoc && publicacionDoc.exists) {
          this.publicacion = publicacionDoc.data() as Publicacion;
          this.isLoading = false;
        }
      });
    });
  }

  aceptarTrabajo(): void {
    if (this.trabajo) {
      this.trabajo.estado = 'Aceptado'; 
      const trabajoId = this.route.snapshot.queryParams['trabajoId'];
      this.firestore.collection<Trabajo>('Trabajos').doc(trabajoId).update(this.trabajo).then(() => {
        console.log('Trabajo actualizado con éxito');
        this.toast.success('Trabajo Contratado');
      }).catch((error) => {
        console.error('Error al actualizar el trabajo:', error);
      });
    }
  }  

  rechazarTrabajo(): void {
    if (this.trabajo) {
      this.trabajo.estado = 'Cancelado'; 
      const trabajoId = this.route.snapshot.queryParams['trabajoId'];
      this.firestore.collection<Trabajo>('Trabajos').doc(trabajoId).update(this.trabajo).then(() => {
        console.log('Trabajo actualizado con éxito');
        this.toast.error('Trabajo Cancelado');
        this.router.navigate(['/contrataciones'])
      }).catch((error) => {
        console.error('Error al actualizar el trabajo:', error);
      });
    }
  }  

  calificar(): void {
    if (this.trabajo) {
      this.trabajo.estado = 'Calificado Por Cliente'; 
      const trabajoId = this.route.snapshot.queryParams['trabajoId'];
      this.firestore.collection<Trabajo>('Trabajos').doc(trabajoId).update(this.trabajo).then(() => {
        console.log('Trabajo actualizado con éxito');
        this.router.navigate(['/calificacion'], { queryParams: { trabajoId } }); // Agrega el parámetro trabajoId a la URL de navegación
      }).catch((error) => {
        console.error('Error al actualizar el trabajo:', error);
      });
    }
  }
  



  pagar() {
    if (this.trabajo) {
      const trabajoId = this.route.snapshot.queryParams['trabajoId'];
      const publicacionId = this.route.snapshot.queryParams['publicacionId'];
      this.router.navigate(['/pago'], { queryParams: { trabajoId, publicacionId } });
    }
  }
  
  
}

