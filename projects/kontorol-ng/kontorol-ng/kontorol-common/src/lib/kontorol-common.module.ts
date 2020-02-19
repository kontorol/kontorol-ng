import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KontorolUtils } from './utils/kontorol-utils';
import { APP_STORAGE_TOKEN, AppStorage } from './app-storage.service';
import { EmptyLogger, KontorolLoggerInjectionToken } from './kontorol-logger';


@NgModule({
    imports: <any[]>[
        CommonModule,
    ],
    declarations: <any[]>[
    ],
    exports: <any[]>[
    ],
    providers: <any[]>[
        ]
})
export class KontorolCommonModule {
    // constructor(@Optional() @SkipSelf() module : KontorolCoreModule, private appBootstrap : AppBootstrap)
    // {
    //     if (module) {
    //         throw new Error("KMCngCoreModule module imported twice.");
    //     }
    // }

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: KontorolCommonModule,
            providers: [
                { provide: APP_STORAGE_TOKEN, useClass: AppStorage },
	            KontorolUtils,
                { provide: KontorolLoggerInjectionToken, useClass: EmptyLogger}
            ]
        };
    }
}
