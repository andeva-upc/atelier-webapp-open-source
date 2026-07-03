import { Component } from '@angular/core';
import {LeftSidebar} from "../../components/left-sidebar/left-sidebar";
import {Main} from "../../components/main/main";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
    imports: [
        LeftSidebar,
        Main
    , TranslateModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
