import { Component,input, output} from '@angular/core';
// import { CategoryWithDetails } from '../../../../../core/models/category.model';
import { CategoryWithDetails } from '../category.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent {
  category=input.required<CategoryWithDetails>();
  categoryid=output<string>();
  onCategoryClick(){
    // console.log(this.category());
    this.categoryid.emit(this.category().id);
   
  }
}
