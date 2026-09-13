-- Performance advisor flagged votes.voter_id (FK to auth.users) as
-- unindexed — missed in the original review of
-- 20260913080000_content_submission_scoring_voting.sql. Every "has this
-- player already voted on this poll" check and the votes_one_ballot_per_poll
-- unique constraint itself benefit from this.
create index votes_voter_id_idx on public.votes (voter_id);
