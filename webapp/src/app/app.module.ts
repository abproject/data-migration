import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderModule } from './features/header/header.module';
import { SidebarModule } from './features/sidebar/sidebar.module';
import { PipelineModule } from './features/pipeline/pipeline.module';
import { StartModule } from './features/start/start.module';
import { CoreModule } from './core/core.module';
import { SharedModule } from '@features/shared';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CoreModule,
    HeaderModule,
    SidebarModule,
    PipelineModule,
    StartModule,
    SharedModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
