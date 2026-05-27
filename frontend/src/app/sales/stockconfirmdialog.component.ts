import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-stock-confirm-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,

  ],
  template: `
    <h2 mat-dialog-title class="text-warning">
      ⚠ Insufficient Stock
    </h2>

    <mat-dialog-content class="mt-2">
      <p>
        <strong>{{ data.productName }}</strong> has limited stock.
      </p>

      <p>
        Available Quantity:
        <strong>{{ data.availableQuantity }}</strong>
      </p>

      <p>
        Requested Quantity:
        <strong>{{ data.requestedQuantity }}</strong>
      </p>

      <p class="text-muted">
        Do you want to raise a stock request ticket for admin approval?
      </p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="close(false)">
        Cancel
      </button>
      <button mat-raised-button color="warn" (click)="close(true)">
        Raise Ticket
      </button>
    </mat-dialog-actions>
  `,
})
export class StockConfirmDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<StockConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      productName: string;
      availableQuantity: number;
      requestedQuantity: number;
    }
  ) {}

  close(result: boolean): void {
    this.dialogRef.close(result);
  }
}