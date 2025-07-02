import { insightService } from "src/insights/insightService";
import { SyncUnknownProcessor } from 'src/insights/processors/SyncUnknownProcessor';
import { UidProcessor } from 'src/insights/processors/UidProcessor';

insightService.register(UidProcessor);
insightService.register(SyncUnknownProcessor);
