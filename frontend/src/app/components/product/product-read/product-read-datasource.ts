import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map } from 'rxjs/operators';
import { Observable, of as observableOf, merge, BehaviorSubject } from 'rxjs';

import { Product } from './../product.model';
import { ProductService } from './../product.service';

/**
 * Data source for the ProductRead2 view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class ProductReadDataSource extends DataSource<Product> {
  paginator: MatPaginator;
  sort: MatSort;
  length: number = 0;

  private products = new BehaviorSubject<Product[]>([]);
  private loadingProducts = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingProducts.asObservable();

  constructor(private productService: ProductService) {
    super();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<Product[]> {
    return this.products.asObservable();
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect() {
    this.products.complete();
    this.loadingProducts.complete();
  }

  loadProducts(
    pageIndex: number = 0,
    pageSize: number = 5,
    sortField: string = 'id',
    sortDirection: string = 'asc'
  ) {
    this.loadingProducts.next(true);

    this.productService
      .paginateSort(pageIndex + 1, pageSize, sortField, sortDirection)
      .subscribe((resp) => {
        var responseProducts = resp.body.map((product: Product) => {
          product.priceWithDiscount =
            product.price * (1 - product.discount / 100);
          return product;
        });

        this.length = +resp.headers.get('X-Total-Count');
        this.products.next(responseProducts);
        this.loadingProducts.next(false);
      });
  }
}
