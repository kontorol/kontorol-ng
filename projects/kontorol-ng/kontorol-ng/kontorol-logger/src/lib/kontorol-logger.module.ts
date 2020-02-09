import { NgModule, ModuleWithProviders, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { kontorolLogger, kontorolLoggerName } from './kontorol-logger.service';
import { JL } from 'jsnlog';
import { kontorolLoggerRecordService } from './kontorol-logger-record.service';

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
export class kontorolLoggerModule {


    static forRoot(name: string): ModuleWithProviders {
        return {
          ngModule: kontorolLoggerModule,
          providers: [
	          kontorolLogger,
	          {
		          provide: kontorolLoggerName, useValue: name
	          },
            kontorolLoggerRecordService
          ]
        }
    }
}

