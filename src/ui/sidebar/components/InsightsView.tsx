import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Contact } from "src/contacts";
import { InsightQueItem, RunType } from "src/insights/insight.d";
import { insightService } from "src/insights/insightService";

type ActionProps = {
  setDisplayInsightsView: (displayActionView: boolean) => void;
  processContacts: Contact[];
};

function groupByProcessorNameMap(items: InsightQueItem[]): Map<string, InsightQueItem[]> {
  const grouped = new Map<string, InsightQueItem[]>();

  for (const item of items) {
    const list = grouped.get(item.name) ?? [];
    list.push(item);
    grouped.set(item.name, list);
  }

  return grouped;
}


export const InsightsView = (props: ActionProps) => {
  const [loading, setLoading] = useState(true);
  const [writing, setWriting] = useState(false);
  const writeTimerRef = useRef<number | null>(null);
  const [contacts] = useState(() => props.processContacts);
  const [immediateResults, setImmediateResults] = useState<Map<string, InsightQueItem[]>>(new Map());
  const [batchResults, setBatchResults] = useState<Map<string, InsightQueItem[]>>(new Map());

  useEffect(() => {
    if(loading) {
      return;
    }

    if (writeTimerRef.current !== null) {
      clearTimeout(writeTimerRef.current);
    }

    if(writing) {
      writeTimerRef.current = window.setTimeout(() => {
        if(!loading) {
          setWriting(false);
          writeTimerRef.current = null;
        }
      }, 250);
      return;
    }

    // if the detect user is manipulating files manually then we go back to the main view.
    props.setDisplayInsightsView(false);
  }, [props.processContacts]);

  useEffect(() => {
    async function load() {
      try {
        setWriting(true);
        const immediateResults = await insightService.process(contacts, RunType.IMMEDIATELY);
        const batchResults = await insightService.process(contacts, RunType.BATCH);

        if (immediateResults.length === 0 && batchResults.length === 0) {
          setWriting(false);
          setLoading(false);
        }


        setImmediateResults(groupByProcessorNameMap(immediateResults))
        setBatchResults(groupByProcessorNameMap(batchResults))
        setLoading(false);

      } catch (e) {
        console.error('error loading insights', e);
      }
    }
    load();
  }, []);

  return (
    <div className="contacts-view">

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
        <div className="contacts-view-close" >
          <div className="modal-close-button" onClick={() => props.setDisplayInsightsView(false)}></div>
        </div>
      )}


      {
        !loading ? (
          Array.from(immediateResults.entries()).length === 0 && Array.from(batchResults.entries()).length === 0 ? (
                  <div className="action-card">
                    <div className="action-card-content action-card-content--no-height">
                      <p>No insights available.</p>
                    </div>
                  </div>
              ) : null
        ) : null
      }

      {
        !loading ? (
          Array.from(immediateResults.entries()).length > 0 ? (
            Array.from(immediateResults.entries()).map(([key, insights]) => (
              insights[0].renderGroup(insights)
            ))
          ) : null
        ) : null
      }

      {
        !loading ? (
          Array.from(immediateResults.entries()).length > 0 ? (
            Array.from(immediateResults.entries()).map(([key, insights]) => (
              insights.map(insight => (
                insight.render(insight)
              ))
            ))
          ) : null
        ) : null
      }

      {/*<div className="action-card">*/}
      {/*  <div className="action-card-content action-card-content--no-height">*/}
      {/*    <p>No insights available.</p>*/}
      {/*  </div>*/}
      {/*  <div className="modal-close-button"></div>*/}
      {/*</div>*/}

      {/*<div className="action-card">*/}
      {/*  <div className="action-card-content">*/}
      {/*    <p><b>3</b> birthdays in the next 7 days.</p>*/}
      {/*    <p><b>16</b> profile improvements possible.</p>*/}
      {/*  </div>*/}
      {/*  <button*/}
      {/*    className="action-card-button"*/}
      {/*  >Go</button>*/}
      {/*  <div className="modal-close-button"></div>*/}
      {/*</div>*/}
    </div>
  )
}
