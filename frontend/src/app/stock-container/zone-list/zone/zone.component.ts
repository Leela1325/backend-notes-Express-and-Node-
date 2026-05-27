import { Component , input,  output} from '@angular/core';
// import { ZoneWithCounts } from '../../../../../core/models/zone.model';
import { ZoneWithCounts } from '../zone.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-zone',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './zone.component.html',
  styleUrl: './zone.component.scss'
})
export class ZoneComponent  {
// @Input({required:true}) zoneData!:ZoneWithCounts;
zoneData=input.required<ZoneWithCounts>();
// @Output() zoneId=new EventEmitter<number>();
zoneId=output<string>();
onZoneClick(){
this.zoneId.emit(this.zoneData().id);
}
}
