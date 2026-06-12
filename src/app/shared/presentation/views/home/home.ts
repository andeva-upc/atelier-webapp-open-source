import { Component } from '@angular/core';
import {LeftSidebar} from "../../components/left-sidebar/left-sidebar";
import {Main} from "../../components/main/main";

@Component({
  selector: 'app-home',
    imports: [
        LeftSidebar,
        Main
    ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
