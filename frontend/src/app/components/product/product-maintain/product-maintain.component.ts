import { DialogData } from './../../shared/confirmation-dialog/dialog-data.model';
import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { formatNumber } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';

import { Product } from './../product.model';
import { ProductService } from './../product.service';

import { ConfirmationDialogComponent } from './../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-product-create',
  templateUrl: './product-maintain.component.html',
  styleUrls: ['./product-maintain.component.css'],
})
export class ProductMaintainComponent implements OnInit {
  product: Product = {
    id: null,
    name: '',
    description: '',
    price: null,
    discount: null,
  };
  priceWithDiscount: string = null;
  productForm: FormGroup = null;

  private loadingProducts = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingProducts.asObservable();

  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(LOCALE_ID) private locale: string,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id');
    if (id != 0) {
      this.loadProduct(id);
    }
    this.setProductForm();
  }

  get title(): String {
    return this.product.id ? 'Alterar Produto' : 'Novo produto';
  }

  get name(): any {
    return this.productForm.get('name');
  }
  get description(): any {
    return this.productForm.get('description');
  }
  get price(): any {
    return this.productForm.get('price');
  }
  get discount(): any {
    return this.productForm.get('discount');
  }

  loadProduct(id: number) {
    this.loadingProducts.next(true);
    this.productService.readById(id).subscribe((product) => {
      this.product = product;
      this.calculatePriceWithDiscount();
      this.setProductForm();
      this.loadingProducts.next(false);
    });
  }

  setProductForm() {
    this.productForm = new FormGroup({
      name: new FormControl(this.product.name, [
        Validators.required,
        Validators.maxLength(100),
      ]),
      description: new FormControl(this.product.description, [
        Validators.required,
        Validators.maxLength(500),
      ]),
      price: new FormControl(this.product.price, [
        Validators.required,
        Validators.min(0),
      ]),
      discount: new FormControl(this.product.discount, [
        Validators.required,
        Validators.min(0),
        Validators.max(100),
      ]),
    });

    this.productForm.valueChanges.subscribe((product) => {
      this.product.name = product.name;
      this.product.description = product.description;
      this.product.price = product.price;
      this.product.discount = product.discount;
    });
  }

  calculatePriceWithDiscount(): void {
    let numero = this.product.price * (1 - this.product.discount / 100);
    this.priceWithDiscount = formatNumber(numero, this.locale, '1.2-2');
  }

  saveProduct(): void {
    if (this.productForm.valid) {
      if (this.product.discount == 100) {
        this.openDialog().subscribe((result) => {
          if (result) {
            this.persistProduct();
          }
        });
      } else {
        this.persistProduct();
      }
    }
  }

  private persistProduct(): void {
    this.productService.save(this.product).subscribe(() => {
      if (this.product.id) {
        this.productService.showMessage('Produto atualizado com sucesso!');
      } else {
        this.productService.showMessage('Produto criado com sucesso!');
      }
      this.router.navigate(['/products']);
    });
  }

  cancel(): void {
    this.router.navigate(['/products']);
  }

  openDialog(): Observable<Boolean> {
    const data: DialogData = {
      title: 'Confirmação',
      message:
        'O produto está com 100% de desconto. Deseja confirmar a operação?',
      negativeButtonText: 'Cancelar',
      positiveButtonText: 'Confirmar',
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      maxWidth: '400px',
      data: data,
    });

    return dialogRef.afterClosed();
  }
}
