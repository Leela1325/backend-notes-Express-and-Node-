import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { CategoryService } from '../../../../core/services/category.service';
import { CategoryService } from './category.service';
import { CategoryComponent } from "./category/category.component";
import { CommonModule } from '@angular/common';
// import { CategoryWithDetails } from '../../../../core/models/category.model';
import { CategoryWithDetails } from './category.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CategoryComponent,CommonModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss'
})
export class CategoryListComponent implements OnInit {
  categoryService=inject(CategoryService);
  router=inject(Router);
  route=inject(ActivatedRoute);
  activeRoute=inject(ActivatedRoute);
  categories=signal<CategoryWithDetails[]>([]);
  ngOnInit(): void {
    this.route.paramMap.subscribe(params=>{
      const id=params.get('zoneid');
      this.loadCategories(id)
    })
  }


  loadCategories(id:string|null){
    // this.categoryService.getCategoriesWithProductCount()
    this.categoryService.getCategoryWithDetails(id).subscribe(data=>{
      this.categories.set(data);
      // console.log(this.categories());
    })
  }
  onCategoryClick(id:string){
    this.router.navigate(['category',id],{
      relativeTo:this.route
    })
  }
}


// his.route.paramMap.pipe(
//       // 1. Extract the ID and convert to number
//       map(params => Number(params.get('zoneid'))),
//       // 2. Switch to the data-fetching observable
//       // switchMap automatically cancels the previous request if the ID changes quickly
//       switchMap(id => this.categoryService.getCategoryWithDetails(id))
//     ).subscribe(data => {
//       this.categories = data;
//       console.log('Categories updated for new Zone ID:', data);
//     });