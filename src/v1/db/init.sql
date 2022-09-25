-- public.task definition

-- Drop table

-- DROP TABLE public.task;

CREATE TABLE public.task (
	task_id int4 NOT NULL GENERATED ALWAYS AS IDENTITY, -- Unique identifier of the task
	task_name varchar(255) NOT NULL, -- Name of the task
	task_description varchar(2000) NULL, -- Description of the task
	task_done bool NOT NULL DEFAULT false, -- Whether or not the task is done
	task_creation_date timestamp NOT NULL DEFAULT now(), -- Creation date of the task
	task_last_update_date timestamp NULL DEFAULT now(), -- Last update date of the task
	CONSTRAINT task_pk PRIMARY KEY (task_id)
);

-- Column comments

COMMENT ON COLUMN public.task.task_id IS 'Unique identifier of the task';
COMMENT ON COLUMN public.task.task_name IS 'Name of the task';
COMMENT ON COLUMN public.task.task_description IS 'Description of the task';
COMMENT ON COLUMN public.task.task_done IS 'Whether or not the task is done';
COMMENT ON COLUMN public.task.task_creation_date IS 'Creation date of the task';
COMMENT ON COLUMN public.task.task_last_update_date IS 'Last update date of the task';