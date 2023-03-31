import React, { useRef, useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import Badge from "@mui/material/Badge";
import TextField from "@mui/material/TextField";
import { progressData } from "../../utils/mockData";
import { styled } from "@mui/material/styles";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { getProgressBarStatus } from "../../utils/getProgressBarStatus";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { CalendarPickerSkeleton } from "@mui/x-date-pickers/CalendarPickerSkeleton";

interface Props {
  percentage: number;
}

type CustomPickerDayProps = PickersDayProps<Date> & {
  status: string;
  isSelected: number;
};

const theme = createTheme({
  components: {
    MuiBadge: {
      styleOverrides: {
        badge: {
          top: "5%",
        },
      },
    },
    // @ts-ignore
    MuiDayPicker: {
      styleOverrides: {
        weekDayLabel: {
          width: "40px",
          height: "40px",
        },
      },
    },
    // @ts-ignore
    MuiCalendarPicker: {
      styleOverrides: {
        root: {
          minHeight: "500px",
        },
      },
    },
    MuiCalendarOrClockPicker: {
      styleOverrides: {
        root: {
          "> div": {
            maxHeight: "unset",
          },
        },
      },
    },
    PrivatePickersSlideTransition: {
      styleOverrides: {
        root: {
          "&.MuiDayPicker-slideTransition": {
            minHeight: "400px",
          },
        },
      },
    },
  },
});

const CustomPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) => prop !== "status" && prop !== "isSelected",
})<CustomPickerDayProps>(({ status, isSelected }) => ({
  width: "40px",
  height: "40px",
  fontSize: "16px",
  fontWeight: 600,
  ...(isSelected && {
    color: status === "" ? "#000000" : "#ffffff",
    backgroundColor:
      status === "Stress"
        ? "#F05F6B"
        : status === "Mild Stress"
        ? "#FAA519"
        : status === "Recovery"
        ? "#0EAD90"
        : "",
    "&:hover, &:focus": {
      backgroundColor:
        status === "Stress"
          ? "#F05F6B"
          : status === "Mild Stress"
          ? "#FAA519"
          : status === "Recovery"
          ? "#0EAD90"
          : "",
    },
  }),
}));

const filterObject: Record<string, unknown> =
  progressData?.reduce((acc, { HRVDate, DailyMean }) => {
    const date = dayjs(HRVDate).format("D");
    acc[date] = DailyMean;
    return acc;
  }, {}) || {};

function getRandomNumber(min: number, max: number) {
  return Math.round(Math.random() * (max - min) + min);
}

/**
 * Mimic fetch with abort controller https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort
 * ⚠️ No IE11 support
 */
function fakeFetch(date: Dayjs, { signal }: { signal: AbortSignal }) {
  return new Promise<{ daysToHighlight: number[] }>((resolve, reject) => {
    const daysInMonth = date.daysInMonth();
    const daysToHighlight = Array.from({ length: daysInMonth }).map(() =>
      getRandomNumber(1, 100)
    );

    resolve({ daysToHighlight });

    signal.onabort = () => {
      reject(new DOMException("aborted", "AbortError"));
    };
  });
}

const initialValue = dayjs();

export default function ServerRequestDatePicker({ percentage }: Props) {
  const requestAbortController = useRef<AbortController | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedDays, setHighlightedDays] = useState(progressData);
  const [value, setValue] = React.useState<Dayjs | null>(initialValue);

  // const fetchHighlightedDays = (date: Dayjs) => {
  //   const controller = new AbortController();
  //   fakeFetch(date, {
  //     signal: controller.signal,
  //   })
  //     .then(({ daysToHighlight }) => {
  //       setHighlightedDays(daysToHighlight);
  //       setIsLoading(false);
  //     })
  //     .catch((error) => {
  //       // ignore the error if it's caused by `controller.abort`
  //       if (error.name !== "AbortError") {
  //         throw error;
  //       }
  //     });

  //   requestAbortController.current = controller;
  // };

  // useEffect(() => {
  //   fetchHighlightedDays(initialValue);
  //   // abort request on unmount
  //   return () => requestAbortController.current?.abort();
  // }, []);

  const handleMonthChange = (date: Dayjs) => {
    if (requestAbortController.current) {
      // make sure that you are aborting useless requests
      // because it is possible to switch between months pretty quickly
      requestAbortController.current.abort();
    }

    setIsLoading(true);
    setHighlightedDays([]);
    // fetchHighlightedDays(date);
  };

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <StaticDatePicker
          displayStaticWrapperAs="desktop"
          value={value}
          loading={isLoading}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          onMonthChange={handleMonthChange}
          renderInput={(params) => <TextField {...params} />}
          renderLoading={() => <CalendarPickerSkeleton />}
          renderDay={(day, _value, DayComponentProps) => {
            const dayWithScore = filterObject[day.date()];
            const isSelected =
              !DayComponentProps.outsideCurrentMonth && dayWithScore;
            const { color, status } = getProgressBarStatus(
              dayWithScore as number
            );

            return (
              <div key={day.date()} className="flex flex-col">
                <Badge
                  key={day.toString()}
                  overlap="circular"
                  badgeContent={
                    <>
                      {isSelected ? (
                        <span className="w-1.5 h-1.5 bg-[#0070C9] rounded-full" />
                      ) : null}
                    </>
                  }
                >
                  <CustomPickersDay
                    status={status}
                    isSelected={isSelected}
                    {...DayComponentProps}
                  />
                </Badge>
                {isSelected ? (
                  <div style={{ color: color }} className="my-2 text-center">
                    {dayWithScore === "-" ? "-" : dayWithScore}
                  </div>
                ) : null}
              </div>
            );
          }}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
}
