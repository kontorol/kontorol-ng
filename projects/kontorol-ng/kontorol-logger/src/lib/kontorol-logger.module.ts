import { NgModule, ModuleWithProviders, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KontorolLogger, KontorolLoggerName } from './kontorol-logger.service';
import { JL } from 'jsnlog';
import { KontorolLoggerRecordService } from './kontorol-logger-record.service';

if (window && window.onerror) {
    window.onerror = null;
}

@NgModule({
    imports: <any[]>[
        CommonModule
    ],
    declarations: <any[]>[

    ],
    exports: <any[]>[
    ],
    providers: <any[]>[
    ]
})
export class KontorolLoggerModule {


    static forRoot(name: string): ModuleWithProviders {
        return {
          ngModule: KontorolLoggerModule,
          providers: [
	          KontorolLogger,
	          {
		          provide: KontorolLoggerName, useValue: name
	          },
            KontorolLoggerRecordService
          ]
        }
    }
}

