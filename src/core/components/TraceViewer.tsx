import { useFile2, useToken } from "@/hooks/use-file"
import { ScansRecord, ScansResponse } from "@/types/pocketbase-types"
import { TraceObj, RequestTrace, ResponseTrace, TraceWrap, Traces } from "@/types/trace"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { DataItem, DataItemValueOnly } from "./DataItem"
import { siteConfig } from "@/config/site"
/*
type ResourceSendRequestArgs = {
    data: {
        frame: string,
        priority: string,
        renderBlocking: string,
        requestId: string,
        requestMethod: string,
        url: string,
    }
}

// https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/preview#heading=h.yr4qxyxotyw
type TraceEvent = {
    args: object,
    name: string, // The name of the event, as displayed in Trace Viewer
    cat: string, // The event categories. This is a comma separated list of categories for the event. The categories can be used to hide events in the Trace Viewer UI.
    ph: string, // The event type. This is a single character which changes depending on the type of event being output. The valid values are listed in the table below. We will discuss each phase type below.
    ts: number, // The tracing clock timestamp of the event. The timestamps are provided at microsecond granularity
    tts?: number, // Optional. The thread clock timestamp of the event. The timestamps are provided at microsecond granularity.
    pid: number, // The process ID for the process that output this event.
    tid: number, // The process ID for the process that output this event.
    // interesting fields from which we extract values
    requestMethod?: string,
    url?: string
}

type TraceObj = {
    traceEvents: Array<TraceEvent>
}

type TraceProps = {
    traceObj: TraceObj,
}

function getEventByName(traceEvents: Array<TraceEvent>, name: string): Array<TraceEvent> {
    return traceEvents.filter(event => event.name === name)
}
*/




function TraceTable({traceData}: {traceData: Traces}) {
    return(
        <Table className="w-full table-fixed">
  <TableCaption>Trace data from scan.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead >Time</TableHead>
      <TableHead >Type</TableHead>
      <TableHead className="text-right">Method</TableHead>
      <TableHead className="text-right">Request</TableHead>
      <TableHead className="test-right">Response</TableHead>
      <TableHead className="xl:w-[700px] lg:w-[450px] md:w-[200px] w-[150px]">URL</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {traceData.traces.map(value => {
        return (
            <TableRow>
                <TableCell>{value.request.ts}s</TableCell>
                <TableCell className="font-medium">{value.request.type}</TableCell>
                <TableCell className="text-right">{value.request.method}</TableCell>
                <TableCell className="text-right">{value.request.resourceType}</TableCell>
                <TableCell className="text-right">{value.response?.status}</TableCell>
                <TableCell className="truncate">
                    <DataItemValueOnly>
                    {value.request.url}
                    </DataItemValueOnly>
                </TableCell>
            </TableRow>
        )
    })}
  </TableBody>
</Table>
    )
}

export default function Traceviewer({scanItem}: {scanItem: ScansResponse}) {
    const {html} = useFile2(scanItem)
    if(!html) return "Loading"
    const traceObj = JSON.parse(html) as unknown as Traces
    if(siteConfig.traceVersions.includes(traceObj.version)) {
        return(
                <TraceTable traceData={traceObj}/>
        )
    } else {
        return(
            <div>Trace is older/newer version that is currently supported. Trace version is {traceObj.version || "unknown"}, supported versions are: {siteConfig.traceVersions.join(",")}</div>
        )
    }
}