import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { kontorolUtils } from './utils/kontorol-utils';
import { APP_STORAGE_TOKEN, AppStorage } from './app-storage.service';
import { EmptyLogger, kontorolLoggerInjectionToken } from './kontorol-logger';


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
export class kontorolCommonModule {
    // constructor(@Optional() @SkipSelf() module : kontorolCoreModule, private appBootstrap : AppBootstrap)
    // {
    //     if (module) {
    //         throw new Error("KMCngCoreModule module imported twice.");
    //     }
    // }

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: kontorolCommonModule,
            providers: [
                { provide: APP_STORAGE_TOKEN, useClass: AppStorage },
	            kontorolUtils,
                { provide: kontorolLoggerInjectionToken, useClass: EmptyLogger}
            ]
        };
    }
}
