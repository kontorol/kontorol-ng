import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule, MenuModule } from 'primeng/primeng';
import { StickyDatatableHeaderDirective } from './directives/sticky-datatable-header.directive';
import { DropdownCloseOnScroll } from './directives/dropdown-close-on-scroll';
import { MenuCloseOnScroll } from './directives/menu-close-on-scroll';
import { KontorolCommonModule } from '@kontorol-ng/kontorol-common';

/**
 * @deprecated use separated module for each component
 */
@NgModule({
    imports: <any[]>[
        CommonModule, InputTextModule, MenuModule, KontorolCommonModule
    ],
    declarations: <any[]>[
	    StickyDatatableHeaderDirective,
        DropdownCloseOnScroll,
        MenuCloseOnScroll
    ],
    exports: <any[]>[
	    StickyDatatableHeaderDirective,
        DropdownCloseOnScroll,
        MenuCloseOnScroll
    ],
    providers: <any[]>[
    ]
})
export class KontorolPrimeNgUIModule {}
