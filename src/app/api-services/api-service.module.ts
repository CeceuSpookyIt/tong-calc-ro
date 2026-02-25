import { NgModule } from '@angular/core';
import { AuthService } from './auth.service';
import { PresetService } from './preset.service';
import { SharedBuildService } from './shared-build.service';

@NgModule({
  providers: [AuthService, PresetService, SharedBuildService],
})
export class ApiServiceModule {}
