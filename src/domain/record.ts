export class Record {
    constructor(
        public id: string | undefined,
        public title: string,
        public time: number
    ) {}

    public static newRecord(
        id: string | undefined,
        title: string,
        time: number
    ): Record {
        return new Record(
            id,
            title,
            time
        );
    }
}
