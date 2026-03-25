import { Record } from "@/domain/record";
import { supabase } from "@/utils/supabase";

const db_name = "study-record";

export async function GetAllRecords(): Promise<Record[]> {
    const { data, error } = await supabase.from(db_name).select("*");
    if (error) {
        throw new Error(error.message);
    }

    const recordData = data.map((record) => {
        return Record.newRecord(record.id, record.title, record.time);
    })

    return recordData;
}

export async function InsertRecord(record: Record): Promise<void> {
    const { title, time } = record;
    const { error } = await supabase.from(db_name).insert({ title, time });
    if (error) {
        throw new Error(error.message);
    }
}

export async function UpdateRecord(record: Record): Promise<void> {
    const { id, title, time } = record;
    const { error } = await supabase.from(db_name).update({ title, time }).eq('id', id);
    if (error) {
        throw new Error(error.message);
    }
};

export async function DeleteRecord(id: string): Promise<void> {
    const { error } = await supabase.from(db_name).delete().match({id});
    if (error) {
        throw new Error(error.message);
    }
}



