import { AlarmSeverity } from '../pv/PV';
import { PVEngine } from '../pv/PVEngine';
import { PVWrapper } from './PVWrapper';

const SUPPORTED_DATE_FORMAT_PATTERNS = ['yyyy', 'MM', 'dd', 'HH', 'mm', 'ss', 'nnnnnnnnn'];

export class PVUtil {

    constructor(private pvEngine: PVEngine) {
    }

    getDouble(pv: PVWrapper) {
        // It probably already is a float, but parseFloat again to emit error if it's not
        return parseFloat(pv.getValue());
    }

    getLong(pv: PVWrapper) {
        // It probably already is an int, but parseInt again to emit error if it's not
        return parseInt(pv.getValue(), 10);
    }

    getString(pv: PVWrapper) {
        return String(pv.getValue());
    }

    getTimeInMilliseconds(pv: PVWrapper) {
        const dt = pv._pv.time;
        return dt?.getTime() ?? 0;
    }

    getTimeString(pv: PVWrapper, format = "yyyy-MM-dd HH:mm:ss.nnnnnnnnn") {
        const dt = pv._pv.time;
        if (dt) {
            let result = format;
            for (const pattern of SUPPORTED_DATE_FORMAT_PATTERNS) {
                result = result.replace(pattern, this.formatDate(dt, pattern));
            }
            return result;
        }
        return null;
    }

    getSeverity(pv: PVWrapper) {
        switch (pv._pv.severity) {
            case AlarmSeverity.NONE:
                return 0;
            case AlarmSeverity.MAJOR:
                return 1;
            case AlarmSeverity.MINOR:
                return 2;
            default:
                return -1;
        }
    }

    getSeverityString(pv: PVWrapper) {
        return String(pv._pv.severity);
    }

    getStatus(pv: PVWrapper) {
        return pv._pv.alarmName;
    }

    private formatDate(date: Date, format: string) {
        if (format === 'yyyy') {
            return String(date.getUTCFullYear());
        } else if (format === 'MM') {
            const m = date.getUTCMonth() + 1;
            return (m < 10) ? '0' + m : '' + m;
        } else if (format === 'dd') {
            const d = date.getUTCDate();
            return (d < 10) ? '0' + d : '' + d;
        } else if (format === 'HH') {
            const h = date.getUTCHours();
            return (h < 10) ? '0' + h : '' + h;
        } else if (format === 'mm') {
            const m = date.getUTCMinutes();
            return (m < 10) ? '0' + m : '' + m;
        } else if (format === 'ss') {
            const s = date.getUTCSeconds();
            return (s < 10) ? '0' + s : '' + s;
        } else if (format === 'nnnnnnnnn') {
            const m = date.getUTCMilliseconds();
            if (m < 10) {
                return '00' + m;
            } else if (m < 100) {
                return '0' + m;
            } else {
                return '' + m;
            }
        } else {
            throw new Error(`Unexpected format '${format}'`);
        }
    }
}
