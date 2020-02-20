import { Injectable, SkipSelf, Optional, Self, Inject, Provider, OnDestroy } from '@angular/core';
import { JL } from 'jsnlog';
import { InjectionToken } from '@angular/core';
import { KontorolLoggerRecordService } from './kontorol-logger-record.service';

export const KontorolLoggerName = new InjectionToken<string>('kontorol-logger-name');

export type Context = { [key: string]: any };
export type DefferedContext = () => Context;
export type LogLevels = 'All' | 'Trace' | 'Debug' | 'Info' | 'Warn' | 'Error' | 'Fatal' | 'Off';

let randomLoggerNameNumber = 1;

@Injectable()
export class KontorolLogger implements OnDestroy {
  static resetDefaultExecuted = false;

  static resetDefaultJSNLog() {
    if (!KontorolLogger.resetDefaultExecuted) {
      KontorolLogger.resetDefaultExecuted = true;
      const consoleAppender = JL.createConsoleAppender('consoleAppender');

      JL().setOptions({
        appenders: [consoleAppender]
      });
    }
  }


  static createLogger(loggerName: string): Provider[] {
    return [
      KontorolLogger,
      {
        provide: KontorolLoggerName, useValue: loggerName
      }
    ];
  }


  private _name: string;
  private _logger: JL.JSNLogLogger;

  public get name(): string {
    return this._name;
  }


  constructor(@Inject(KontorolLoggerName) @Optional() @Self() name: string,
              @SkipSelf() @Optional() parentLogger: KontorolLogger,
              @Optional() private _loggerRecordInterceptor: KontorolLoggerRecordService) {

    KontorolLogger.resetDefaultJSNLog();

    if (!name) {
      name = 'logger' + randomLoggerNameNumber;
      randomLoggerNameNumber++;
    }

    name = name.replace(/[.]/g, '_');

    this._name = parentLogger ? `${parentLogger.name}.${name}` : name;
    this._logger = JL(this._name);
    this._logger.trace('logger created!');
  }

  private _addLogToBuffer(logItem: any): void {
    if (this._loggerRecordInterceptor) {
      this._loggerRecordInterceptor.addLogItemToBuffer(logItem);
    }
  }

  public startRecordingLogs(): void {
    if (this._loggerRecordInterceptor) {
      this._loggerRecordInterceptor.startRecord();
    }
  }

  public getRecordedLogs(): any[] | void {
    if (this._loggerRecordInterceptor) {
      return this._loggerRecordInterceptor.getRecordedLogs();
    }
  }

  public isValidLogLevel(level: LogLevels): boolean {
    const validLogLevels = ['All', 'Trace', 'Debug', 'Info', 'Warn', 'Error', 'Fatal', 'Off'];
    return validLogLevels.indexOf(level) !== -1;
  }

  public setOptions(options: { level?: LogLevels }): void {
    let level: number = undefined;
    if (this.isValidLogLevel(options.level) && JL) {
      const getLevelValue = JL[`get${options.level}Level`];
      level = typeof getLevelValue === 'function' ? getLevelValue() : undefined;
    }

    JL().setOptions({level: level});
  }

  public subLogger(name: string): KontorolLogger {
    return new KontorolLogger(name, this, this._loggerRecordInterceptor);
  }

  ngOnDestroy() {
    this._logger.debug('logger destroyed');
    delete this._logger;

  }

  private _createLogObject(level: string, message: string, context: Context | Error): any {
    this._addLogToBuffer({level, message, context});
    return context ? Object.assign({message, level}, context) : message;
  }

  public trace(message: string, context?: Context): void;
  public trace(message: string, context?: DefferedContext): void;
  public trace(message: string, context?: Context | DefferedContext): void {
    if (context && typeof context === 'function') {
      this._logger.trace(() => this._createLogObject('trace', message, context()));
    } else {
      this._logger.trace(this._createLogObject('trace', message, <Context>context));
    }
  }

  public debug(message: string, context?: Context): void;
  public debug(message: string, context?: DefferedContext): void;
  public debug(message: string, context?: Context | DefferedContext): void {
    if (context && typeof context === 'function') {
      this._logger.debug(() => this._createLogObject('debug', message, context()));
    } else {
      this._logger.debug(this._createLogObject('debug', message, <Context>context));
    }
  }

  public info(message: string, context?: Context): void;
  public info(message: string, context?: DefferedContext): void;
  public info(message: string, context?: Context | DefferedContext): void {
    if (context && typeof context === 'function') {
      this._logger.info(() => this._createLogObject('info', message, context()));
    } else {
      this._logger.info(this._createLogObject('info', message, <Context>context));
    }
  }

  public warn(message: string, context?: Context): void;
  public warn(message: string, context?: DefferedContext): void;
  public warn(message: string, context?: Context | DefferedContext): void {
    if (context && typeof context === 'function') {
      this._logger.warn(() => this._createLogObject('warn', message, context()));
    } else {
      this._logger.warn(this._createLogObject('warn', message, <Context>context));
    }
  }

  public error(message: string, context?: Context): void;
  public error(message: string, error?: Error): void;
  public error(message: string, context?: Error | Context): void {
    this._logger.error(this._createLogObject('error', message, context));
  }

  public fatal(message: string, context?: Context): void;
  public fatal(message: string, error?: Error): void;
  public fatal(message: string, context?: Error | Context): void {
    if (context && context instanceof Error) {
      this._logger.fatalException(message, context);
    } else {
      this._logger.fatal(this._createLogObject('fatal', message, context));
    }
  }
}
