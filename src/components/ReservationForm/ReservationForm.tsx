import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  useForm,
  SubmitHandler,
  FieldValues,
  Controller,
} from "react-hook-form";
import { Input } from "../Input/Input";
import {
  Button,
  Card,
  Loader,
  NumberInput,
  createStyles,
  rem,
} from "@mantine/core";
import { DateInput, DateValue } from "@mantine/dates";
import "./Reservation.css";
import { Dropdown } from "../Dropdown/Dropdown";

const useStyles = createStyles(
  (theme, { floating }: { floating: boolean }) => ({
    root: {
      position: "relative",
    },

    label: {
      position: "absolute",
      zIndex: 2,
      top: rem(7),
      left: theme.spacing.sm,
      pointerEvents: "none",
      color: floating
        ? theme.colorScheme === "dark"
          ? theme.white
          : theme.black
        : theme.colorScheme === "dark"
        ? theme.colors.dark[3]
        : theme.colors.gray[5],
      transition:
        "transform 150ms ease, color 150ms ease, font-size 150ms ease",
      transform: floating
        ? `translate(-${theme.spacing.sm}, ${rem(-28)})`
        : "none",
      fontSize: floating ? theme.fontSizes.xs : theme.fontSizes.sm,
      fontWeight: floating ? 500 : 400,
    },

    required: {
      transition: "opacity 150ms ease",
      opacity: floating ? 1 : 0,
    },

    input: {
      "&::placeholder": {
        transition: "color 150ms ease",
        color: !floating ? "transparent" : undefined,
      },
    },
  }),
);

const ReservationForm = () => {
  const { control, handleSubmit, getValues, setValue, resetField, reset } =
    useForm<FieldValues>({
      defaultValues: {
        firstName: "",
        lastName: "",
        movie: "",
        tickets: 1,
        date: "",
        showtime: "",
      },
    });

  const [focused, setFocused] = useState(false);
  const [, setDate] = useState(getValues("date"));
  const { classes } = useStyles({
    floating: (getValues("date") && focused) || focused,
  });

  console.log(getValues("date"));

  // Also useful, just didn't fit the case
  // function formatDate(date: string | number | DateValue) {
  //   var d = new Date(date),
  //     month = "" + (d.getMonth() + 1),
  //     day = "" + d.getDate(),
  //     year = d.getFullYear();

  //   if (month.length < 2) month = "0" + month;
  //   if (day.length < 2) day = "0" + day;

  //   return [year, month, day].join("-");
  // }

  function formatDate(date: DateValue) {
    if (!date) return "";
    let value = new Date(date!);
    const offset = date?.getTimezoneOffset();
    value = new Date(value.getTime() - offset! * 60 * 1000);
    return value.toISOString().split("T")[0];
  }

  const handleDateChange = (value: DateValue) => {
    console.log(value);
    setValue("date", value);
    setDate(value);
    if (getValues("showtime")) resetField("showtime");
  };

  interface Dates {
    date: string;
    showtimes: string[];
  }

  interface Movie {
    id: string;
    name: string;
    available_dates: Dates[];
  }

  // Queries
  const {
    error,
    isFetching,
    data: movies = [],
  } = useQuery<Movie[]>({
    queryKey: ["movies"],
    queryFn: () => axios.get("http://localhost:3001").then((res) => res.data),
    refetchOnWindowFocus: false,
  });

  // Mutations
  const mutation = useMutation({
    mutationFn: (reservation: FieldValues) => {
      const body = {
        ...reservation,
        date: formatDate(reservation.date),
      };

      return axios
        .post("http://localhost:3001/reservation", body)
        .then((res) => res.data);
    },
    onSuccess: () => {
      // Invalidate and refetch
      // queryClient.invalidateQueries({ queryKey: ["movies"] });

      console.log("I'm first!");
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    mutation.mutate(data);
    reset();
  };

  const movieOptions = movies.map((movie) => {
    return {
      label: movie.name,
      value: movie.name,
    };
  });

  // interface Option {
  //   value: string;
  //   label: string;
  // }

  const showtimes = movies
    .find((movie) => movie.name === getValues("movie"))
    ?.available_dates.find((d) => d.date === formatDate(getValues("date")))
    ?.showtimes.map((showtime) => {
      return {
        value: showtime,
        label: showtime,
      };
    });

  // const showtimes = useMemo(() => {
  //   movies
  //     .find((movie) => movie.name === getValues("movie"))
  //     ?.available_dates.find((d) => d.date === formatDate(getValues("date")))
  //     ?.showtimes.map((showtime) => {
  //       return {
  //         value: showtime,
  //         label: showtime,
  //       };
  //     });
  // }, [getValues, movies, date]);

  console.log(showtimes);

  const resetMovieRelatedFields = () => {
    // setValue("date", "");
    // setValue("showtime", "");
    resetField("date");
    resetField("showtime");
  };

  if (isFetching) return <Loader color="pink" size={100} variant="bars" />;

  if (error)
    return (
      <Card style={{ textAlign: "center" }}>
        <h1>Something went wrong</h1>
        <p>Try refreshing the page or come back later.</p>
      </Card>
    );

  return (
    <Card className="Card">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          control={control}
          label="First Name"
          placeholder="First Name"
          name="firstName"
          rules={{
            required: "This field is required.",
            minLength: {
              value: 3,
              message: "First Name needs to have at least 3 characters.",
            },
          }}
        />

        <Input
          control={control}
          label="Last Name"
          placeholder="Last Name"
          name="lastName"
          rules={{
            required: "This field is required.",
            minLength: {
              value: 3,
              message: "Last Name needs to have at least 3 characters.",
            },
          }}
        />

        <Dropdown
          control={control}
          label="Movie"
          placeholder="Movie"
          name="movie"
          options={movieOptions}
          onChange={resetMovieRelatedFields}
          rules={{
            required: "This field is required.",
          }}
        />

        <Controller
          name="tickets"
          control={control}
          render={({ field }) => (
            <NumberInput
              {...field}
              defaultValue={1}
              placeholder="Number of tickets"
              label="Number of ticktets"
              min={1}
            />
          )}
        />

        <Controller
          name="date"
          control={control}
          rules={{
            required: "This field is required.",
          }}
          render={({ field, fieldState }) => (
            <DateInput
              {...field}
              value={field.value}
              classNames={classes}
              label={fieldState.error ? "" : "Date"}
              placeholder="Date"
              mx={0}
              error={
                fieldState.error &&
                !field.value && <span>{fieldState?.error?.message}</span>
              }
              onFocus={() => setFocused(true)}
              onBlur={() => !field.value && setFocused(false)}
              onChange={(e) => handleDateChange(e)}
              excludeDate={(date) => {
                if (getValues("movie")) {
                  const extractedDates = movies
                    .find((movie) => movie.name === getValues("movie"))
                    ?.available_dates.map((d) => d.date);

                  return !extractedDates?.includes(
                    formatDate(date),
                  ) as unknown as boolean;
                }

                return true;
              }}
            />
          )}
        />

        <Dropdown
          control={control}
          label="Showtime"
          placeholder="Showtime"
          name="showtime"
          options={showtimes || []}
          rules={{
            required: "This field is required.",
          }}
        />

        <Button className="SendButton" type="submit">
          Send
        </Button>
      </form>
    </Card>
  );
};

export default ReservationForm;
