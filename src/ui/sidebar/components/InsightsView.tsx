import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { insightService } from "src/insights/insightService";
import { insightQueueStore } from "src/insights/insightsQueStore";
import { useOutsideClickHook } from "src/ui/hooks/outsideClickHook";
import { Contact } from "src/contacts";

type ActionProps = {
  setDisplayInsightsView: (displayActionView: boolean) => void;
  processContacts: Contact[];
};

export const InsightsView = (props: ActionProps) => {
  const [loading, setLoading] = useState(true);
  const [groupInsightItems, setGroupInsightItems] = useState<React.ReactNode[]>([]);
  const [insightItems, setInsightItems] = useState<React.ReactNode[]>([]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  useOutsideClickHook(wrapperRef, () => {
    props.setDisplayInsightsView(false)
  });

  useEffect(() => {
    const unsubscribe = insightService.backgroundProcessRunning.subscribe((running) => {
      setLoading(running);
    });
    return () => unsubscribe();
  }, []);


  useEffect(() => {
    let timeoutId: number | null = null;
    const unsubscribe = insightQueueStore.insightQueItemCount.subscribe(() => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        renderInsights();
      }, 15);
    });

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      unsubscribe();
    };
  }, []);

  function renderInsights() {
    const processorNames = insightQueueStore.getProcessorsInStore();
    const myGroupInsights = [];
    const myInsights = [];
    for (const processorName of processorNames) {
      const queItems = insightQueueStore.getByName(processorName);
      const processor = insightService.getProcessorByName(processorName)
      if (processor) {

        if (queItems.length > 2) {
          const groupInsight = processor.renderGroup({
            queItems
          });
          myGroupInsights.push(groupInsight);
        }

        for (const queItem of queItems) {
          const singleInsight = processor.render({
            queItem,
            dismissItem: async () => {
              await insightQueueStore.dismissItem(queItem);
              renderInsights();
            }
          })
          myInsights.push(singleInsight);
        }
      }
    }

    setGroupInsightItems(myGroupInsights);
    setInsightItems(myInsights);
  }

  return (
    <div ref={wrapperRef} className="contacts-view">

      {loading ? (
        <div className="progress-bar progress-bar--contacts">
          <div className="progress-bar-message u-center-text">Loading Insights...</div>
          <div className="progress-bar-indicator">
            <div className="progress-bar-line"></div>
            <div className="progress-bar-subline mod-increase"></div>
            <div className="progress-bar-subline mod-decrease"></div>
          </div>
        </div>
      ) : (
        <div className="contacts-view-close">
          <div className="modal-close-button" onClick={() => props.setDisplayInsightsView(false)}></div>
        </div>
      )}

      {
        !loading ? (
          insightItems.length === 0 ? (
            <div className="action-card">
              <div className="action-card-content action-card-content--no-height">
                <p>No insights available.</p>
              </div>
            </div>
          ) : null
        ) : null
      }

      {
        !loading && groupInsightItems.length > 0
          ? groupInsightItems
          : null
      }

      {
        !loading && insightItems.length > 0
          ? insightItems
          : null
      }
    </div>
  )
}
