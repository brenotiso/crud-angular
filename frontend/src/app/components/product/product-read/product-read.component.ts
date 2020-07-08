import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Product } from './../product.model';
import { ProductService } from '../product.service';
import { ProductReadDataSource } from './product-read-datasource';

@Component({
  selector: 'app-product-read',
  templateUrl: './product-read.component.html',
  styleUrls: ['./product-read.component.css'],
})
export class ProductReadComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<Product>;

  dataSource: ProductReadDataSource;

  displayedColumns = [
    'id',
    'name',
    'description',
    'price',
    'discount',
    'priceWithDiscount',
    'action',
  ];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.dataSource = new ProductReadDataSource(this.productService);
    this.dataSource.loadProducts();
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.table.dataSource = this.dataSource;

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.loadProductsPage()))
      .subscribe();
  }

  loadProductsPage() {
    this.dataSource.loadProducts(
      this.paginator.pageIndex,
      this.paginator.pageSize,
      this.sort.active,
      this.sort.direction
    );
  }
}
