import { NgModule } from '@angular/core';
import { AuthService } from './auth.service';
import { PresetService } from './preset.service';

@NgModule({
  providers: [AuthService, PresetService],
})
export class ApiServiceModule {}
