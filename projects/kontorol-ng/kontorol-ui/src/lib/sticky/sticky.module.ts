import { ModuleWithProviders, NgModule } from '@angular/core';
import { KontorolCommonModule } from '@kontorol-ng/kontorol-common';
import { StickyComponent } from './components/sticky.component';
import { StickyDirective} from './directives/sticky.directive';
import { StickyScrollService } from './services/sticky-scroll.service';

@NgModule({
    imports: <any[]>[
        KontorolCommonModule
    ],
    declarations: <any[]>[
        StickyComponent,
        StickyDirective
    ],
    exports: <any[]>[
        StickyComponent,
        StickyDirective
    ],
    providers: <any[]>[
    ]
})
export class StickyModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: StickyModule,
            providers: <any[]>[
                StickyScrollService
            ]
        };
    }

}
